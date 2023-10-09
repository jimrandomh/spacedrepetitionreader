import { routes as authPageRoutes } from '../components/pages/authPages';
import { routes as metaPageRoutes } from '../components/pages/metaPages';
import { routes as miscPageRoutes } from '../components/pages/miscPages';
import { Endpoint } from './util/routeUtil';

export const allRoutes: Endpoint[] = [
  ...authPageRoutes,
  ...metaPageRoutes,
  ...miscPageRoutes,
];

export function urlToRoute(url: string): {
  route: Endpoint|null
  routeProps: object
} {
  const parsedUrl = new URL(url, "http://localhost");
  const pathname = parsedUrl.pathname;

  for (const route of allRoutes) {
    const match = route.path.match(pathname)
    if(match) {
      return {route, routeProps: match};
    }
  }
  return {route: null, routeProps: {}};
}
