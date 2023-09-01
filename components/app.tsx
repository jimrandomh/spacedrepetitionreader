import React, { useMemo } from 'react'
import { UserContext } from '../lib/useCurrentUser';
import { Loading } from './widgets';
import { useGetApi } from '../lib/apiUtil';
import { useJssStyles } from '../lib/useJssStyles';
import { LocationContextProvider, ParsedLocation } from '../lib/useLocation';
import { ModalContextProvider } from '../lib/useModal';
import { Error404Page, RedirectToLoginPage } from '../components/pages';
import { pathToRoute } from '../lib/routes';

export function App({url}: {
  url: string
}) {
  const classes = useJssStyles("App", () => ({
    root: {
      fontFamily: "sans-serif",
    },
  }));

  const {route,routeProps} = pathToRoute(url);
  const location: ParsedLocation = useMemo(() => ({
    url, route, routeProps
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [url, route, JSON.stringify(routeProps)]);

  const {loading: currentUserLoading, data} = useGetApi<ApiTypes.ApiWhoami>({
    endpoint: "/api/users/whoami",
    query: {}
  });

  const currentUser = data?.currentUser ?? null;

  if (!location || !location.route) {
    return <Error404Page/>
  }

  const CurrentRouteComponent = location.route.component;
  if (currentUserLoading) {
    return <Loading/>;
  }
  if (location.route.access === 'LoggedIn' && !currentUser) {
    return <RedirectToLoginPage/>
  }
  
  return <div className={classes.root}>
    <LocationContextProvider value={location}>
    <UserContext.Provider value={currentUser}>
    <ModalContextProvider>
      <CurrentRouteComponent {...location.routeProps}/>
    </ModalContextProvider>
    </UserContext.Provider>
    </LocationContextProvider>
  </div>
}

export const components = {App};
