import React from "react";
import type { Request, Response } from 'express';
import { PrismaClient, User } from "@prisma/client";
import { renderToString } from "react-dom/server";
import { App } from "../components/app";
import { GetApiProvider } from "../lib/apiUtil";
import { getPublicConfig } from "../lib/getPublicConfig";
import { RenderContextProvider } from "../lib/renderContext";
import { apiFilterCurrentUser, getUserFromReq } from "./api/auth";
import { getPrisma } from "./db";
import { getApiRoutes, ServerApiGetContext } from "./serverApiUtil";
import { getStaticStylesheet, StylesheetWithHash } from "./staticStylesheet";
import { getConfig } from "./util/getConfig";

export interface SsrResult {
  status: number
  html: string|Buffer
}

export async function renderSSR(currentUser: User|null, req: Request, res: Response, url: string): Promise<SsrResult> {
  console.log(`Rendering ${url}`);
  const db = getPrisma();
  const {apiProvider, ssrCache} = getApiProviderFromUser(currentUser, db);
  const titleRef = {title: getPublicConfig().pageTitle};
  
  function setPageTitle(title: string) {
    if (title) {
      titleRef.title = title;
    }
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


const pageTemplate = ({bodyHtml, title, ssrCache, stylesheet, publicConfig}: {
  bodyHtml: string
  title: string
  ssrCache: any
  stylesheet: StylesheetWithHash
  publicConfig: any
}) => (`<!doctype html>
<head>
  <title>${title}</title>
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


function escapeJsonForScriptTag(json: any) {
  return JSON.stringify(json).replace('</script>','<\\/script>');
}
