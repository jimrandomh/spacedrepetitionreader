import type {Express} from 'express';
import {Prisma, PrismaClient} from '@prisma/client'
import * as ApiTypes from '../lib/apiTypes';
import Route from 'route-parser';

interface ServerApiContext<QueryArgs,BodyArgs> {
  req: Express.Request
  res: Express.Response
  query: QueryArgs
  body: BodyArgs
}

function defineApi<T extends ApiTypes.RestApi>(
  app: Express,
  endpoint: T["path"],
  fn: (ctx: ServerApiContext<T["queryArgs"], T["bodyArgs"]>) => T["responseType"]
) {
  const route = new Route(endpoint);
  
  app.get(endpoint, (req,res) => {
    const queryArgs = route.match(req.url);
    // TODO: Handle args in request body
    const ctx: ServerApiContext<T["queryArgs"], T["bodyArgs"]> = {
      req, res, query: queryArgs,
      body: {},
    };
    const result = fn(ctx);
    res.json(result);
  });
}

export function addApiEndpoints(app: Express) {
  defineApi<ApiTypes.ApiSignup>(app, "/api/users/signup", ctx => {
    return {} //TODO
  });
  defineApi<ApiTypes.ApiLogin>(app, "/api/users/login", ctx => {
    return {} //TODO
  });
  defineApi<ApiTypes.ApiLogout>(app, "/api/users/logout", ctx => {
    return {} //TODO
  });
  defineApi<ApiTypes.ApiListDecks>(app, "/api/decks/list", ctx => {
    return {} //TODO
  });
  
  defineApi<ApiTypes.ApiListCards>(app, "/api/cards/list", ctx => {
    return {} //TODO
  });
  defineApi<ApiTypes.ApiCardsDue>(app, "/api/cards/due", ctx => {
    return {cards: [
      {
        id: 1,
        front: "Why do people stop using spaced repetition apps?",
        back: "Homework assigned by your past self is still homework",
      },
      {
        id: 2,
        front: "What is the eighth day of the week called?",
        back: "Extraday",
      },
      {
        id: 3,
        front: "How many rationalists does it take to screw in a light bulb?",
        back: "The problem with most charity today is that too many focus on vanity metrics like how many people it takes, or how many photons end up striking retinas.",
      },
    ]};
  });
  defineApi<ApiTypes.ApiGetCard>(app, "/api/cards/:cardId", ctx => {
    return {
      front: `PLACEHOLDER ${ctx.query.cardId} front`,
      back: `PLACEHOLDER ${ctx.query.cardId} back`,
    };
  });
}
