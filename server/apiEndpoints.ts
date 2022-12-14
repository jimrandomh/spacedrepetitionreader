import type {Express} from 'express';
import * as ApiTypes from '../lib/apiTypes';
import {defineGetApi,definePostApi,assertLoggedIn} from './serverApiUtil';
import {getFeed} from './feedUtil';
import {addAuthEndpoints} from './auth';

export function addApiEndpoints(app: Express) {
  addAuthEndpoints(app);
  
  defineGetApi<ApiTypes.ApiListDecks>(app, "/api/decks/list", ctx => {
    assertLoggedIn(ctx);
    return { decks: [] } //TODO
  });
  definePostApi<ApiTypes.ApiCreateDeck>(app, "/api/decks/create", ctx => {
    assertLoggedIn(ctx);
    const {name} = ctx.body;
    throw new Error("Not implemented"); // TODO
  });


  defineGetApi<ApiTypes.ApiListCards>(app, "/api/cards/list", ctx => {
    assertLoggedIn(ctx);
    return {} //TODO
  });
  defineGetApi<ApiTypes.ApiCardsDue>(app, "/api/cards/due", ctx => {
    return {cards: [
      {
        id: 1,
        front: "Why do people stop using spaced repetition apps?",
        back: "It doesn't provide intrinsic reward.",
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
  defineGetApi<ApiTypes.ApiGetCard>(app, "/api/cards/:cardId", ctx => {
    return {
      front: `PLACEHOLDER ${ctx.query.cardId} front`,
      back: `PLACEHOLDER ${ctx.query.cardId} back`,
    };
  });
  
  defineGetApi<ApiTypes.ApiLoadFeed>(app, "/api/feed/load/:feedUrl", async (ctx) => {
    const {feedUrl} = ctx.query;
    const feedItems = await getFeed(feedUrl);
    return {feedItems};
  });
}
