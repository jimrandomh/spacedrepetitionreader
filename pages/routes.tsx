import * as React from 'react'
import {FrontPage} from './FrontPage';
import {AboutPage} from './AboutPage';
import Route from 'route-parser';

export type Endpoint = {
  path: Route,
  component: any,
};

export const routes: Endpoint[] = [
  {
    path: new Route("/"),
    component: FrontPage,
  },
  {
    path: new Route("/about"),
    component: AboutPage,
  },
  {
    path: new Route("/echo/:id"),
    component: ({id}: {id: string}) => {
      return <div>Echo: {id}</div>
    },
  },
];
