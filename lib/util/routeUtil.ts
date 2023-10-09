import React from 'react';
import Route from 'route-parser';

export type RouteOptions = {
  name: string
  path: string
  access: "LoggedOut"|"LoggedIn"|"AdminOnly",
}
export type Endpoint = {
  name: string,
  path: Route,
  component: React.FC<any>,
  access: "LoggedOut"|"LoggedIn"|"AdminOnly",
};


export function defineRoute(options: RouteOptions, render: React.FC): Endpoint {
  return {
    name: options.name,
    path: new Route(options.path),
    access: options.access,
    component: render,
  };
}
