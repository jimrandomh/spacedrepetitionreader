import * as React from 'react'
import {routes,Endpoint} from '../pages/routes';
import type Route from 'route-parser';


export function App() {
  let currentRoute: Endpoint|null = null;
  let routeProps: any = null;
  const pathname = window.location.pathname;
  
  for (let route of routes) {
    let match = route.path.match(pathname)
    if(match) {
      currentRoute = route;
      routeProps = match;
    }
  }
  
  if (!currentRoute) {
    return <div className="root">
      Not found
    </div>
  }
  
  const CurrentRouteComponent = currentRoute.component;
  return <div className="root">
    <CurrentRouteComponent {...routeProps}/>
  </div>
}
