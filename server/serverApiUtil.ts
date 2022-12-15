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
  currentUser: User|null
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
      currentUser: await getUserFromReq(req, db),
    };
    
    try {
      const result = await fn(ctx);
      res.json(result);
    } catch(e) {
      res.status(400);
      res.json({error: e.message});
    }
  });
}

export function definePostApi<T extends ApiTypes.RestApiPost>(
  app: Express,
  endpoint: T["path"],
  fn: (ctx: ServerApiPostContext<T["queryArgs"], T["bodyArgs"]>) => Promise<T["responseType"]>
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
      currentUser: await getUserFromReq(req,db),
    };
    try {
      const result = await fn(ctx);
      res.json(result);
    } catch(e) {
      res.status(400);
      res.json({error: e.message});
    }
  });
}


export function assertLoggedIn(ctx: ServerApiContext): User {
  const {currentUser} = ctx;
  if (!currentUser) {
    throw new Error("Not logged in");
  }
  return currentUser;
}

export function assertIsInt(value: any): number {
  const num = parseInt(value);
  if(isNaN(num)) throw new Error(`Argument must be a number; was ${JSON.stringify(value)}`);
  return num;
}

export function assertIsString(value: any): string {
  if(typeof(value) !== 'string')
    throw new Error("Argument must be a string");
  return (value as string);
}
