import type { Express, Request, Response } from 'express';
import type { User, PrismaClient } from '@prisma/client'
import { getPrisma } from './db';
import { getUserFromReq } from './api/auth';
import mapValues from 'lodash/mapValues';
import Route from 'route-parser';
import bodyParser from 'body-parser';
import Cookies from 'universal-cookie';

export interface ServerApiContext {
  req: Request|null
  res: Response|null
  db: PrismaClient
  currentUser: User|null
}
export interface ServerApiGetContext<QueryArgs> extends ServerApiContext {
  query: QueryArgs
  searchParams: URLSearchParams
}

interface ServerApiPostContext<QueryArgs,BodyArgs> extends ServerApiContext {
  query: QueryArgs
  body: BodyArgs
}

export const getApiRoutes: {route: Route, fn: any}[] = [];

export function defineGetApi<T extends ApiTypes.RestApiGet>(
  app: Express,
  endpoint: T["path"],
  fn: (ctx: ServerApiGetContext<T["queryArgs"]>) => T["responseType"]|Promise<T["responseType"]>
) {
  const route = new Route(endpoint);
  
  const getFn = async (req: Request, res: Response) => {
    const parsedRoute = route.match(req.url);
    const parsedUrl = new URL(req.url, "http://localhost");
    if (!parsedRoute) throw new Error("Invalid URL: "+req.url);
    const queryArgs = mapValues(parsedRoute, (v:string)=>decodeURIComponent(v));
    const db = getPrisma();
    const ctx: ServerApiGetContext<T["queryArgs"]> = {
      req, res, query: queryArgs, db,
      currentUser: await getUserFromReq(req, res, db),
      searchParams: parsedUrl.searchParams,
    };
    
    try {
      const result = await fn(ctx);
      res.json(result);
    } catch(e) {
      res.status(400);
      console.log(e.message);
      res.json({error: e.message});
    }
  };
  
  getApiRoutes.push({
    route,
    fn: async (ctx: ServerApiGetContext<T["queryArgs"]>) => {
      return await fn(ctx);
    }
  })
  
  app.get(endpoint, getFn);
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
      currentUser: await getUserFromReq(req, res, db),
    };
    try {
      const result = await fn(ctx);
      res.json(result);
    } catch(e) {
      res.status(400);
      console.log(e.message);
      res.json({error: e.message});
    }
  });
}


export function assertLoggedIn(ctx: ServerApiContext): User {
  const {currentUser} = ctx;
  if (!currentUser) {
    throw new ApiErrorAccessDenied;
  }
  return currentUser;
}

export function assertLoggedInAdmin(ctx: ServerApiContext): User {
  const {currentUser} = ctx;
  if (!currentUser || !currentUser.isAdmin) {
    throw new ApiErrorAccessDenied;
  }
  return currentUser;
}

export function assertIsKey(value: any): DbKey {
  return assertIsString(value);
}

function _assertIsInt(value: any): number {
  const num = parseInt(value);
  if(isNaN(num)) throw new Error(`Argument must be a number; was ${JSON.stringify(value)}`);
  return num;
}

export function assertIsNumber(value: any): number {
  const num = parseFloat(value);
  if(isNaN(num)) throw new Error(`Argument must be a number; was ${JSON.stringify(value)}`);
  return num;
}

export function assertIsString(value: any): string {
  if(typeof(value) !== 'string')
    throw new Error("Argument must be a string");
  return (value as string);
}

export function assertIsBoolean(value: any): boolean {
  if(typeof(value) !== 'boolean')
    throw new Error("Argument must be a boolean");
  return (value as boolean);
}


export function getCookie(req: Request, name: string) {
  const cookies = new Cookies((req as any).headers.cookie);
  return cookies.get(name)
}

export function setCookie(res: Response, name: string, value: string, options: any) {
  (res as any).cookie(name, value, options);
}


export class ApiError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export class ApiErrorNotFound extends ApiError {
  constructor() {
    super("Not found");
  }
}

export class ApiErrorAccessDenied extends ApiError {
  constructor() {
    super("Access denied");
  }
}

export class ApiErrorNotImplemented extends ApiError {
  constructor() {
    super("Not implemented");
  }
}

export class ApiErrorImportFailed extends ApiError {
  constructor(message: string) {
    super(message);
  }
}
