import React from 'react'
import {routes,Endpoint} from '../lib/routes';
import {UserContextProvider} from '../lib/useCurrentUser';
import {Error404Page} from '../components/pages';
import {ModalContextProvider} from '../lib/useModal';

function locationToRoute(location: Location): {
  route: Endpoint|null
  routeProps: object
} {
  const pathname = location.pathname;
  for (const route of routes) {
    const match = route.path.match(pathname)
    if(match) {
      return {route, routeProps: match};
    }
  }
  return {route: null, routeProps: {}};
}

export function App() {
  const {route: currentRoute, routeProps} = locationToRoute(window.location);
  
  
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
