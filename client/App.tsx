import React from 'react'
import {routes,Endpoint} from '../lib/routes';
import {UserContextProvider} from '../lib/useCurrentUser';
import {Error404Page} from '../components/pages';
import {ModalContextProvider} from '../lib/useModal';
import type Route from 'route-parser';


function locationToRoute(location: Location): {
  route: Endpoint|null
  routeProps: {}
} {
  const pathname = location.pathname;
  for (let route of routes) {
    let match = route.path.match(pathname)
    if(match) {
      return {route, routeProps: match};
    }
  }
  return {route: null, routeProps: {}};
}

export function App() {
  let {route: currentRoute, routeProps} = locationToRoute(window.location);
  
  
  if (!currentRoute) {
    return <Error404Page/>
  }
  
  const CurrentRouteComponent = currentRoute.component;
  return <div className="root">
    <UserContextProvider>
    <ModalContextProvider>
      <CurrentRouteComponent {...routeProps}/>
    </ModalContextProvider>
    </UserContextProvider>
  </div>
}
