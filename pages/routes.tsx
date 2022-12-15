import * as React from 'react'
import {FrontPage} from './FrontPage';
import {LoginPage} from './LoginPage';
import {AboutPage} from './AboutPage';
import {ViewCard} from './ViewCard';
import {ManageDecks} from './ManageDecks';
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
    component: FrontPage,
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
