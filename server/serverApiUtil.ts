import type {Express} from 'express';
import type {User} from '@prisma/client'
import type {PrismaClient} from '@prisma/client'
import * as ApiTypes from '../lib/apiTypes';
import {getPrisma} from './db';
import {getUserFromReq} from './auth';
import mapValues from 'lodash/mapValues';
import Route from 'route-parser';
import bodyParser from 'body-parser';

export interface ServerApiContext {
  req: Express.Request
  res: Express.Response
  db: PrismaClient
  user: User|null
}
export interface ServerApiGetContext<QueryArgs> extends ServerApiContext {
  query: QueryArgs
}

export interface ServerApiPostContext<QueryArgs,BodyArgs> extends ServerApiContext {
  query: QueryArgs
  body: BodyArgs
}

export function defineGetApi<T extends ApiTypes.RestApiGet>(
  app: Express,
  endpoint: T["path"],
  fn: (ctx: ServerApiGetContext<T["queryArgs"]>) => T["responseType"]|Promise<T["responseType"]>
) {
  const route = new Route(endpoint);
  
  app.get(endpoint, async (req,res) => {
    const parsedRoute = route.match(req.url);
    if (!parsedRoute) throw new Error("Invalid URL");
    const queryArgs = mapValues(parsedRoute, (v:string)=>decodeURIComponent(v));
    const db = getPrisma();
    const ctx: ServerApiGetContext<T["queryArgs"]> = {
      req, res, query: queryArgs, db,
      user: await getUserFromReq(req, db),
    };
    const result = await fn(ctx);
    res.json(result);
  });
}

export function definePostApi<T extends ApiTypes.RestApiPost>(
  app: Express,
  endpoint: T["path"],
  fn: (ctx: ServerApiPostContext<T["queryArgs"], T["bodyArgs"]>) => T["responseType"]|Promise<T["responseType"]>
) {
  const route = new Route(endpoint);
  
  app.post(endpoint, bodyParser.json(), async (req,res) => {
    const parsedRoute = route.match(req.url);
    if (!parsedRoute) throw new Error("Invalid URL");
    const queryArgs = mapValues(parsedRoute, (v:string)=>decodeURIComponent(v));
    const db = getPrisma();
    const requestBody = req.body;
    const ctx: ServerApiPostContext<T["queryArgs"], T["bodyArgs"]> = {
      req, res, db,
      query: queryArgs,
      body: requestBody,
      user: await getUserFromReq(req,db),
    };
    const result = await fn(ctx);
    res.json(result);
  });
}

export function assertLoggedIn(ctx: ServerApiContext) {
  if (!ctx.user) {
    throw new Error("Not logged in");
  }
}
