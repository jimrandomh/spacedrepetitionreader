import * as Pages from '../components/pages';
import Route from 'route-parser';

export type Endpoint = {
  path: Route,
  component: any,
  access: "LoggedOut"|"LoggedIn"|"AdminOnly",
};

export const routes: Endpoint[] = [
  {
    path: new Route("/"),
    access: "LoggedOut",
    component: Pages.LandingPage,
  },
  {
    path: new Route("/dashboard"),
    access: "LoggedIn",
    component: Pages.DashboardPage,
  },
  {
    path: new Route("/login"),
    access: "LoggedOut",
    component: Pages.LoginPage,
  },
  {
    path: new Route("/decks/manage"),
    access: "LoggedIn",
    component: Pages.ManageDecks,
  },
  {
    path: new Route("/feeds/manage"),
    access: "LoggedIn",
    component: Pages.ManageFeeds,
  },
  {
    path: new Route("/feeds/add"),
    access: "LoggedIn",
    component: Pages.AddFeedPage,
  },
  {
    path: new Route("/feeds/:id"),
    access: "LoggedIn",
    component: Pages.ViewFeedPage,
  },
  {
    path: new Route("/decks/edit/:id"),
    access: "LoggedIn",
    component: Pages.EditDeck,
  },
  {
    path: new Route("/about"),
    access: "LoggedOut",
    component: Pages.AboutPage,
  },
  {
    path: new Route("/privacy-policy"),
    access: "LoggedOut",
    component: Pages.PrivacyPolicyPage,
  },
  {
    path: new Route("/card/:id"),
    access: "LoggedIn",
    component: Pages.ViewCardPage,
  },
  {
    path: new Route("/profile"),
    access: "LoggedIn",
    component: Pages.UserProfilePage,
  },
  {
    path: new Route("/email/forgotPassword"),
    access: "LoggedOut",
    component: Pages.ForgotPasswordRequestPage,
  },
  {
    path: new Route("/email/resetPassword/:token"),
    access: "LoggedOut",
    component: Pages.ResetPasswordPage,
  },
  {
    path: new Route("/email/confirm/:token"),
    access: "LoggedIn",
    component: Pages.ConfirmEmailPage,
  },
];

export function pathToRoute(pathname: string): {
  route: Endpoint|null
  routeProps: object
} {
  for (const route of routes) {
    const match = route.path.match(pathname)
    if(match) {
      return {route, routeProps: match};
    }
  }
  return {route: null, routeProps: {}};
}
