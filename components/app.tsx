import React, { useMemo } from 'react'
import { UserContext } from '../lib/useCurrentUser';
import { Loading } from './widgets';
import { useGetApi } from '../lib/apiUtil';
import { useJssStyles } from '../lib/useJssStyles';
import { LocationContextProvider, ParsedLocation } from '../lib/useLocation';
import { ModalContextProvider } from '../lib/useModal';
import { Error404Page, ErrorAccessDeniedPage, RedirectToLoginPage } from '../components/pages/errorPages';
import { urlToRoute } from '../lib/routes';

export function App({url}: {
  url: string
}) {
  const classes = useJssStyles("App", () => ({
    root: {
      fontFamily: "sans-serif",
    },
  }));

  const {route,routeProps} = urlToRoute(url);
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
  let ComponentToRender = CurrentRouteComponent;
  
  if (currentUserLoading) {
    return <Loading/>;
  }
  if (location.route.access !== 'LoggedOut' && !currentUser) {
    return <LocationContextProvider value={location}>
      <RedirectToLoginPage/>
    </LocationContextProvider>
  }
  if (location.route.access === 'AdminOnly' && !currentUser?.isAdmin) {
    ComponentToRender = ErrorAccessDeniedPage;
  }
  
  return <div className={classes.root}>
    <LocationContextProvider value={location}>
    <UserContext.Provider value={currentUser}>
    <ModalContextProvider>
      <ComponentToRender {...location.routeProps}/>
    </ModalContextProvider>
    </UserContext.Provider>
    </LocationContextProvider>
  </div>
}

export const components = {App};
