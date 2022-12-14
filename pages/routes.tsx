import * as React from 'react'
import {FrontPage} from './FrontPage';
import {LoginPage} from './LoginPage';
import {AboutPage} from './AboutPage';
import {ViewCard} from './ViewCard';
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
    path: new Route("/about"),
    access: "LoggedOut",
    component: AboutPage,
  },
  {
    path: new Route("/card/:id"),
    access: "LoggedIn",
    component: ({id}: {id: string}) => {
      return <ViewCard id={id}/>
    },
  },
];
