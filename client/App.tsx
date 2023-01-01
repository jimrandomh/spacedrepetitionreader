import React from 'react'
import {pathToRoute} from '../lib/routes';
import {App} from '../components/layout';
import {GetApiProvider,GetApiContext} from '../lib/apiUtil';


export function AppClient() {
  const location = window.location;
  const {route: currentRoute, routeProps} = pathToRoute(location.pathname);
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
    <App route={currentRoute} routeProps={routeProps}/>
  </GetApiContext.Provider>
}
declare global {
  interface Window {
    ssrCache: Record<string,any>
  }
}

