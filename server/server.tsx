import React from 'react';
import {renderToString} from 'react-dom/server';
import express, {Express,Request,Response} from 'express';
import path from 'path';
import {addApiEndpoints} from './api/apiEndpoints';
import {App} from '../components/layout';
import { GetApiProvider } from '../lib/apiUtil';
import {ServerApiGetContext, getApiRoutes} from './serverApiUtil';
import {apiFilterCurrentUser, getUserFromReq} from './api/auth';
import {getPrisma} from './db';
import {getStaticStylesheet, StylesheetWithHash} from './staticStylesheet';
import {initJss} from '../lib/useJssStyles';
import process from 'process';
import { getConfig } from './util/getConfig';
import { PrismaClient, User } from '@prisma/client';
import { addCardsDueCronjob } from './cardsDueNotification';
import { RenderContextProvider } from '../lib/renderContext';
import { getPublicConfig } from '../lib/getPublicConfig';

const projectRoot = path.join(__dirname, '..');
const staticFilesPath = path.join(projectRoot, 'static');

interface SsrResult {
  status: number
  html: string|Buffer
}

function serverStartup() {
  const app = express()
  const port = getConfig().port;
  
  initJss();
  addApiEndpoints(app);
  addCardsDueCronjob();
  serverRoutes(app);
  
  app.listen(port, () => {
    console.log(`Listening on port ${port}`)
  })
}

function serverRoutes(app: Express) {
  app.use('/static', express.static(staticFilesPath))
  //app.use('/', express.static(path.join(projectRoot, 'index.html')));
  app.use('/client.js', express.static(path.join(projectRoot, 'build/client.js')));
  app.use('/client.js.map', express.static(path.join(projectRoot, 'build/client.js.map')));
  app.get('/styles.css', (req, res) => {
    const {css,hash} = getStaticStylesheet();
    
    const requestedHash = req.query?.hash;
    if (requestedHash === hash) {
      res.writeHead(200, {
        "Cache-Control": "public, max-age=604800, immutable",
        "Content-Type": "text/css; charset=utf-8"
      });
      res.end(css);
    } else {
      res.writeHead(404);
      res.end("");
    }
  });
  app.get('*', async (req, res) => {
    if (req.url === '/favicon.ico') {
      res.status(404);
      res.end('');
      return;
    }
    const {status, html} = await renderSSR(req, res, req.url)
    res.writeHead(status);
    res.end(html);
  });
  
  console.log(`Serving static files from ${staticFilesPath}`);
}

const pageTemplate = ({bodyHtml, ssrCache, stylesheet, publicConfig}: {
  bodyHtml: string
  title: string
  ssrCache: any
  stylesheet: StylesheetWithHash
  publicConfig: any
}) => (`<!doctype html>
<head>
  <title>{title}</title>
  <script defer src="/client.js"></script>
  <link rel="stylesheet" type="text/css" href="/styles.css?hash=${stylesheet.hash}"></link>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <meta charset="utf-8"/>
</head>
<body><div id="react-root">${bodyHtml}</div></body>
<script>
window.publicConfig = ${escapeJsonForScriptTag(publicConfig)};
window.ssrCache = ${escapeJsonForScriptTag(ssrCache)}
</script>`);

async function renderSSR(req: Request, res: Response, url: string): Promise<SsrResult> {
  console.log(`Rendering ${url}`);
  const db = getPrisma();
  const currentUser = await getUserFromReq(req, db);
  const {apiProvider, ssrCache} = getApiProviderFromUser(currentUser, db);
  const titleRef = {title: getPublicConfig().pageTitle};
  
  function setPageTitle(title: string) {
    titleRef.title = title;
  }
  
  const reactTree = <AppServer
    url={url}
    apiProvider={apiProvider}
    setPageTitle={setPageTitle}
  />
  const bodyHtml = await repeatRenderingUntilSettled(url, reactTree, apiProvider);
  const stylesheet = getStaticStylesheet();
  
  const html = pageTemplate({
    bodyHtml, ssrCache, stylesheet,
    title: titleRef.title,
    publicConfig: getConfig().public
  });

  return {
    status: 200,
    html,
  };
}

export function getApiProviderFromUser(currentUser: User|null, db: PrismaClient): {
  apiProvider: GetApiProvider
  ssrCache: Record<string,any>
} {
  const ssrCache: Record<string,any> = {};
  const apiProvider = new GetApiProvider(async (uri: string) => {
    const parsedUrl = new URL(uri,"http://localhost");
    const pathname = parsedUrl.pathname;
    const parsedRoute = pathToApiRoute(pathname);
    if (!parsedRoute) throw new Error("Invalid URL in server API: "+uri);
    const {fn,query} = parsedRoute;
    
    const ctx: ServerApiGetContext<any> = {
      req: null,
      res: null,
      db, currentUser,
      query,
      searchParams: parsedUrl.searchParams,
    }
    const result = await fn(ctx);
    ssrCache[uri] = result;
    return result;
  });
  
  const whoamiResult = {
    currentUser: apiFilterCurrentUser(currentUser)
  };
  ssrCache["/api/users/whoami"] = whoamiResult;
  apiProvider.addToCache({ "/api/users/whoami": whoamiResult });
  
  return {ssrCache, apiProvider};
}

export async function repeatRenderingUntilSettled(uri: string, tree: React.ReactElement, apiProvider: GetApiProvider): Promise<string> {
  while(true) {
    const bodyHtml = renderToString(tree);
    
    if (apiProvider.isAnyPending()) {
      await apiProvider.waitUntilFinished();
    } else {
      return bodyHtml;
    }
  }
}

function escapeJsonForScriptTag(json: any) {
  return JSON.stringify(json).replace('</script>','<\\/script>');
}

function AppServer({url, apiProvider, setPageTitle}: {
  url: string,
  apiProvider: GetApiProvider,
  setPageTitle: (title: string)=>void,
}) {
  return <RenderContextProvider apiProvider={apiProvider} setPageTitle={setPageTitle}>
    <App url={url}/>
  </RenderContextProvider>
}

function pathToApiRoute(pathname: string): {
  fn: any,
  query: any,
}|null {
  for (const routeAndFn of getApiRoutes) {
    const {route,fn} = routeAndFn;
    const matched = route.match(pathname);
    if (matched) {
      return { fn, query: matched };
    }
  }
  return null;
}


process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

serverStartup();
