import * as MiscPages from '../components/pages/miscPages';
import * as AuthPages from '../components/pages/authPages';
import * as MetaPages from '../components/pages/metaPages';
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
    component: MiscPages.LandingPage,
  },
  {
    path: new Route("/dashboard"),
    access: "LoggedIn",
    component: MiscPages.DashboardPage,
  },
  {
    path: new Route("/login"),
    access: "LoggedOut",
    component: AuthPages.LoginPage,
  },
  {
    path: new Route("/decks/manage"),
    access: "LoggedIn",
    component: MiscPages.ManageDecks,
  },
  {
    path: new Route("/feeds/manage"),
    access: "LoggedIn",
    component: MiscPages.ManageFeeds,
  },
  {
    path: new Route("/feeds/:id"),
    access: "LoggedIn",
    component: MiscPages.ViewFeedPage,
  },
  {
    path: new Route("/decks/edit/:id"),
    access: "LoggedIn",
    component: MiscPages.EditDeck,
  },
  {
    path: new Route("/about"),
    access: "LoggedOut",
    component: MetaPages.AboutPage,
  },
  {
    path: new Route("/privacy-policy"),
    access: "LoggedOut",
    component: MetaPages.PrivacyPolicyPage,
  },
  {
    path: new Route("/card/:id"),
    access: "LoggedIn",
    component: MiscPages.ViewCardPage,
  },
  {
    path: new Route("/profile"),
    access: "LoggedIn",
    component: MiscPages.UserProfilePage,
  },
  {
    path: new Route("/first-oauth-login"),
    access: "LoggedIn",
    component: AuthPages.FirstOAuthLoginPage,
  },
  {
    path: new Route("/email/forgotPassword"),
    access: "LoggedOut",
    component: AuthPages.ForgotPasswordRequestPage,
  },
  {
    path: new Route("/email/resetPassword/:token"),
    access: "LoggedOut",
    component: AuthPages.ResetPasswordPage,
  },
  {
    path: new Route("/email/confirm/:token"),
    access: "LoggedOut",
    component: AuthPages.ConfirmEmailPage,
  },
  {
    path: new Route("/admin/dashboard"),
    access: "AdminOnly",
    component: MiscPages.AdminDashboardPage,
  },
];

export function urlToRoute(url: string): {
  route: Endpoint|null
  routeProps: object
} {
  const parsedUrl = new URL(url, "http://localhost");
  const pathname = parsedUrl.pathname;

  for (const route of routes) {
    const match = route.path.match(pathname)
    if(match) {
      console.log(`Found valid route for: ${pathname}`);
      return {route, routeProps: match};
    }
  }
  console.log(`Could not find route for: ${pathname}`);
  return {route: null, routeProps: {}};
}
