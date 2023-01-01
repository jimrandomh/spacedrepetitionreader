import React from 'react';
import {renderToString} from 'react-dom/server';
import express, {Express,Request,Response} from 'express';
import path from 'path';
import {addApiEndpoints} from './apiEndpoints';
import {App} from '../components/layout';
import {pathToRoute} from '../lib/routes';
import {GetApiProvider,GetApiContext} from '../lib/apiUtil';
import {getApiRoutes} from './serverApiUtil';
import {getUserFromReq} from './api/auth';
import {getPrisma} from './db';

const projectRoot = path.join(__dirname, '..');
const staticFilesPath = path.join(projectRoot, 'static');

interface SsrResult {
  status: number
  html: string|Buffer
}

function serverStartup() {
  const app = express()
  const port = 5000
  
  addApiEndpoints(app);
  serveStaticFiles(app);
  
  app.listen(port, () => {
    console.log(`Listening on port ${port}`)
  })
}

function serveStaticFiles(app: Express) {
  app.use('/static', express.static(staticFilesPath))
  //app.use('/', express.static(path.join(projectRoot, 'index.html')));
  app.use('/client.js', express.static(path.join(projectRoot, 'build/client.js')));
  app.use('/client.js.map', express.static(path.join(projectRoot, 'build/client.js.map')));
  app.get('*', async (req, res) => {
    const {status, html} = await renderSSR(req, res, req.url)
    res.writeHead(status);
    res.end(html);
  });
  
  console.log(`Serving static files from ${staticFilesPath}`);
}

const pageTemplate = ({bodyHtml, ssrCache}: {
  bodyHtml: string
  ssrCache: any
}) => (`<!doctype html>
<head>
  <title>Spaced Repetition Reader</title>
  <script defer src="/client.js"></script>
  <link rel="stylesheet" type="text/css" href="/static/styles.css"></link>
</head>
<body><div id="react-root">${bodyHtml}</div></body>
<script>window.ssrCache = ${escapeJsonForScriptTag(ssrCache)}</script>`);

async function renderSSR(req: Request, res: Response, url: string): Promise<SsrResult> {
  const db = getPrisma();
  const currentUser = await getUserFromReq(req, db);
  const ssrCache: Record<string,any> = {};
  
  const apiProvider = new GetApiProvider(async (uri: string) => {
    const parsedUrl = new URL(uri,"http://localhost");
    const pathname = parsedUrl.pathname;
    const parsedRoute = pathToApiRoute(pathname);
    if (!parsedRoute) throw new Error("Invalid URL in server API: "+uri);
    const {fn,query} = parsedRoute;
    
    const ctx = {
      req: null,
      res: null,
      db, currentUser,
      query,
    }
    const result = await fn(ctx);
    ssrCache[uri] = result;
    return result;
  });
  
  const reactTree = <AppServer
    url={url}
    apiProvider={apiProvider}
  />
  const bodyHtml = await repeatRenderingUntilSettled(reactTree, apiProvider);
  
  const html = pageTemplate({
    bodyHtml,
    ssrCache,
  });

  return {
    status: 200,
    html,
  };
}

async function repeatRenderingUntilSettled(tree: React.ReactElement, apiProvider: GetApiProvider): Promise<string> {
  let lastHtml = "";
  let bodyHtml = "";
  
  while(true) {
    bodyHtml = renderToString(tree);
    await sleep(0);
    if (bodyHtml===lastHtml && !apiProvider.isAnyPending())
      break;
    lastHtml = bodyHtml;
  }
  
  return bodyHtml;
}

function escapeJsonForScriptTag(json: any) {
  return JSON.stringify(json).replace('</script>','<\\/script>');
}

function AppServer({url, apiProvider}: {
  url: string,
  apiProvider: GetApiProvider,
}) {
  const {route,routeProps} = pathToRoute(url);
  
  return <GetApiContext.Provider value={apiProvider}>
    <App route={route} routeProps={routeProps}/>
  </GetApiContext.Provider>
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

/*class ServerGetApiProvider implements GetApiProvider {
  doGet<T extends ApiTypes.RestApiGet>(endpoint: T["path"], query: T["queryArgs"]): {
    loading: boolean
    result: T["responseType"]
  } {
    console.log(`ServerGetApiProvider.doGet ${endpoint}`);
    throw new Error("Not implemented"); //TODO
  }
}*/

function sleep(delayMs: number): Promise<void> {
  return new Promise<void>(accept => {
    setTimeout(accept, delayMs);
  });
}

serverStartup();
