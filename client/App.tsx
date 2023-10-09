import React from 'react'
import { App } from '../components/app';
import { GetApiProvider } from '../lib/apiUtil';
import { RenderContextProvider } from '../lib/renderContext';


export function AppClient() {
  const location = window.location;
  const apiProvider = new GetApiProvider(async (uri: string) => {
    const fetchResult = await fetch(uri, {
      method: "GET",
    });
    const body = await fetchResult.json();
    return body;
  });
  if (window.ssrCache) {
    apiProvider.addToCache(window.ssrCache);
  }
  
  return <RenderContextProvider apiProvider={apiProvider} setPageTitle={setPageTitle}>
    <App url={location.href}/>
  </RenderContextProvider>
}

function setPageTitle(title: string) {
  window.document.title = title;
}


declare global {
  interface Window {
    ssrCache: Record<string,any>
  }
}

