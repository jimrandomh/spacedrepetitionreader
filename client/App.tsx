import React from 'react'
import { App } from '../components/layout';
import { GetApiProvider, GetApiContext } from '../lib/apiUtil';


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
  
  return <GetApiContext.Provider value={apiProvider}>
    <App url={location.pathname}/>
  </GetApiContext.Provider>
}
declare global {
  interface Window {
    ssrCache: Record<string,any>
  }
}

