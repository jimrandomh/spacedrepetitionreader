import * as React from 'react'
import {LandingPage} from './LandingPage';
import {DashboardPage} from './DashboardPage';
import {LoginPage} from './LoginPage';
import {AboutPage} from './AboutPage';
import {ViewCard} from './ViewCard';
import {ManageDecks} from './ManageDecks';
import {ManageFeeds} from './ManageFeeds';
import {EditDeck} from './EditDeck';
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
    component: LandingPage,
  },
  {
    path: new Route("/dashboard"),
    access: "LoggedIn",
    component: DashboardPage,
  },
  {
    path: new Route("/login"),
    access: "LoggedOut",
    component: LoginPage,
  },
  {
    path: new Route("/decks/manage"),
    access: "LoggedIn",
    component: ManageDecks,
  },
  {
    path: new Route("/feeds/manage"),
    access: "LoggedIn",
    component: ManageFeeds,
  },
  {
    path: new Route("/decks/edit/:id"),
    access: "LoggedIn",
    component: ({id}: {id: string}) => {
      return <EditDeck id={parseInt(id)}/>
    },
  },
  {
    path: new Route("/about"),
    access: "LoggedOut",
    component: AboutPage,
  },
  {
    path: new Route("/card/:id"),
    access: "LoggedIn",
    component: ({id}: {id: string}) => {
      return <ViewCard id={parseInt(id)}/>
    },
  },
];
