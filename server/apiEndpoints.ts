import type {Express} from 'express';
import type {Card,Deck} from '@prisma/client'
import * as ApiTypes from '../lib/apiTypes';
import {defineGetApi,definePostApi,assertLoggedIn,assertIsInt,assertIsString,ServerApiContext} from './serverApiUtil';
import {getFeed} from './feedUtil';
import {addAuthEndpoints} from './auth';

export function addApiEndpoints(app: Express) {
  addAuthEndpoints(app);
  
  defineGetApi<ApiTypes.ApiListDecks>(app, "/api/decks/list", async (ctx) => {
    const currentUser = assertLoggedIn(ctx);
    
    const decks = await ctx.db.deck.findMany({
      where: {
        deleted: false,
        authorId: currentUser.id,
      }
    });
    
    return {
      decks: decks.map(deck => apiFilterDeck(deck, ctx)!)
    }
  });
  
  definePostApi<ApiTypes.ApiCreateDeck>(app, "/api/decks/create", async (ctx) => {
    const currentUser = assertLoggedIn(ctx);
    const {name} = ctx.body;
    
    const deck = await ctx.db.deck.create({
      data: {
        name,
        authorId: currentUser.id,
        deleted: false,
      }
    });
    
    return {
      id: deck.id,
    };
  });
  
  definePostApi<ApiTypes.ApiDeleteDeck>(app, "/api/decks/delete", async (ctx) => {
    const currentUser = assertLoggedIn(ctx);
    const deckId = assertIsInt(ctx.body.id);
    const deck = await ctx.db.deck.findUnique({
      where: {id: deckId}
    });
    if (!deck)
      throw new Error("Invalid deck ID");
    if (deck.authorId !== currentUser.id)
      throw new Error("Access denied");
    
    await ctx.db.deck.update({
      where: {id: deckId},
      data: {deleted: true}
    });
    
    return {};
  });
  
  defineGetApi<ApiTypes.ApiGetDeck>(app, "/api/decks/:id", async (ctx) => {
    const currentUser = assertLoggedIn(ctx);
    const id = assertIsInt(ctx.query.id);
    
    const deck = await ctx.db.deck.findUnique({ where: {id} });
    if (!deck || deck.deleted) throw new Error("Invalid deck ID");
    
    const cards = await ctx.db.card.findMany({
      where: { deleted: false, deckId: id }
    });
    
    return {
      deck: apiFilterDeck(deck, ctx),
      cards: cards.map(card => apiFilterCard(card, ctx)!),
    };
  });


  definePostApi<ApiTypes.ApiCreateCard>(app, "/api/cards/create", async (ctx) => {
    const currentUser = assertLoggedIn(ctx);
    const deckId = assertIsInt(ctx.body.deckId);
    const front = assertIsString(ctx.body.front);
    const back = assertIsString(ctx.body.back);
    
    // Check that deckId is valid
    const deck = await ctx.db.deck.findUnique({ where: {id: deckId} });
    if (!deck || deck.deleted) throw new Error("Invalid deck ID");
    
    const card = await ctx.db.card.create({
      data: {
        deckId, front, back,
        deleted: false,
      }
    });
    
    return {id: card.id};
  });
  
  defineGetApi<ApiTypes.ApiListCards>(app, "/api/cards/list", async (ctx) => {
    assertLoggedIn(ctx);
    return {} //TODO
  });
  
  defineGetApi<ApiTypes.ApiGetCard>(app, "/api/cards/:cardId", async (ctx) => {
    const currentUser = assertLoggedIn(ctx);
    const cardId = assertIsInt(ctx.query.cardId);
    
    const card = await ctx.db.card.findUnique({where: {id: cardId}});
    if (!card || card.deleted)
      throw new Error("Not found");
    const deck = await ctx.db.deck.findUnique({where: {id: card.deckId}});
    if (!deck || deck.deleted || deck.authorId !== currentUser.id)
      throw new Error("Not found");
    
    return {
      card: apiFilterCard(card, ctx)!
    }
  });
  
  definePostApi<ApiTypes.ApiDeleteCard>(app, "/api/cards/delete", async (ctx) => {
    const currentUser = assertLoggedIn(ctx);
    const cardId = assertIsInt(ctx.body.cardId);
    
    const card = await ctx.db.card.findUnique({where: {id: cardId}});
    if (!card || card.deleted)
      throw new Error("Not found");
    const deck = await ctx.db.deck.findUnique({where: {id: card.deckId}});
    if (!deck || deck.deleted || deck.authorId !== currentUser.id)
      throw new Error("Not found");
    
    await ctx.db.card.update({
      where: {id: cardId},
      data: {deleted: true}
    });
    
    return {};
  });
  
  
  defineGetApi<ApiTypes.ApiCardsDue>(app, "/api/cards/due", async (ctx) => {
    return {cards: []}; // TODO
    /*return {cards: [
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
    ]};*/
  });
  
  
  defineGetApi<ApiTypes.ApiLoadFeed>(app, "/api/feed/load/:feedUrl", async (ctx) => {
    const {feedUrl} = ctx.query;
    const feedItems = await getFeed(feedUrl);
    return {feedItems};
  });
}

function apiFilterDeck(deck: Deck|null, ctx: ServerApiContext): ApiTypes.ApiObjDeck|null {
  if (!deck)
    return null;
  return {
    id: deck.id,
    name: deck.name,
    authorId: deck.authorId
  }
}

function apiFilterCard(card: Card|null, ctx: ServerApiContext): ApiTypes.ApiObjCard|null {
  if (!card)
    return null;
  return {
    id: card.id,
    deckId: card.deckId,
    front: card.front,
    back: card.back,
  };
}
