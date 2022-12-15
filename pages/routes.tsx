import * as React from 'react'
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
    path: new Route("/decks/edit/:id"),
    access: "LoggedIn",
    component: ({id}: {id: string}) => {
      return <Pages.EditDeck id={parseInt(id)}/>
    },
  },
  {
    path: new Route("/about"),
    access: "LoggedOut",
    component: Pages.AboutPage,
  },
  {
    path: new Route("/card/:id"),
    access: "LoggedIn",
    component: ({id}: {id: string}) => {
      return <Pages.ViewCard id={parseInt(id)}/>
    },
  },
];
