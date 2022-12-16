import type {Express} from 'express';
import type {Card,Deck} from '@prisma/client'
import {defineGetApi,definePostApi,assertLoggedIn,assertIsKey,assertIsInt,assertIsNumber,assertIsString,ServerApiContext,ApiErrorNotFound,ApiErrorAccessDenied} from '../serverApiUtil';
import {maybeRefreshFeed,getUnreadItems,apiFilterRssItem} from './feeds';
import {getDueDate} from '../cardScheduler';
import flatten from 'lodash/flatten';
import filter from 'lodash/filter';

export function addDeckEndpoints(app: Express) {
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
    const name = assertIsString(ctx.body.name);
    
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
    const deckId = assertIsKey(ctx.body.id);
    const deck = await ctx.db.deck.findUnique({
      where: {id: deckId}
    });
    if (!deck)
      throw new ApiErrorNotFound;
    if (deck.authorId !== currentUser.id)
      throw new ApiErrorAccessDenied;
    
    await ctx.db.deck.update({
      where: {id: deckId},
      data: {deleted: true}
    });
    
    return {};
  });
  
  defineGetApi<ApiTypes.ApiGetDeck>(app, "/api/decks/:id", async (ctx) => {
    const currentUser = assertLoggedIn(ctx);
    const id = assertIsKey(ctx.query.id);
    
    const deck = await ctx.db.deck.findUnique({ where: {id} });
    if (!deck || deck.deleted) throw new ApiErrorNotFound;
    
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
    const deckId = assertIsKey(ctx.body.deckId);
    const front = assertIsString(ctx.body.front);
    const back = assertIsString(ctx.body.back);
    
    // Check that deckId is valid
    const deck = await ctx.db.deck.findUnique({ where: {id: deckId} });
    if (!deck || deck.deleted) throw new ApiErrorNotFound;
    
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
  
  definePostApi<ApiTypes.ApiDeleteCard>(app, "/api/cards/delete", async (ctx) => {
    const currentUser = assertLoggedIn(ctx);
    const cardId = assertIsKey(ctx.body.cardId);
    
    const card = await ctx.db.card.findUnique({where: {id: cardId}});
    if (!card || card.deleted)
      throw new ApiErrorNotFound;
    const deck = await ctx.db.deck.findUnique({where: {id: card.deckId}});
    if (!deck || deck.deleted || deck.authorId !== currentUser.id)
      throw new ApiErrorNotFound;
    
    await ctx.db.card.update({
      where: {id: cardId},
      data: {deleted: true}
    });
    
    return {};
  });
  
  
  defineGetApi<ApiTypes.ApiCardsDue>(app, "/api/cards/due", async (ctx) => {
    const currentUser = assertLoggedIn(ctx);
    
    // Get decks owned by this user, cards in those decks, and impressions by this user on those cards.
    const decks = await ctx.db.deck.findMany({
      where: {
        deleted: false,
        authorId: currentUser.id,
      },
      include: {
        cards: {
          where: {
            deleted: false
          },
          include: {
            impressions: {
              where: {
                userId: currentUser.id
              }
            }
          }
        }
      }
    });
    
    // Compute a due date for each card
    const cards = flatten(decks.map(deck=>deck.cards));
    const now = new Date();
    const cardsDue = filter(cards, card => {
      const dueDate = getDueDate(card, card.impressions, ctx);
      return dueDate<now;
    });
    
    // Get the user's RSS subscriptions
    const subscriptions = await ctx.db.rssSubscription.findMany({
      where: {
        userId: currentUser.id,
        deleted: false,
      },
      include: {feed: true}
    });
    
    // Refresh any RSS feeds that are stale
    await Promise.all(subscriptions.map(async subscription => {
      await maybeRefreshFeed(subscription.feed, ctx.db)
    }));
    
    // Get unread items in the user's RSS feeds
    const unreadItems = flatten(await Promise.all(subscriptions.map(async subscription => {
      return await getUnreadItems(currentUser, subscription.feed, ctx.db);
    })));
    
    // Return cards that are due
    return {
      cards: cardsDue.map(card => apiFilterCard(card, ctx)!),
      feedItems: unreadItems.map(item => apiFilterRssItem(item, ctx)!),
    };
  });
  
  definePostApi<ApiTypes.ApiRecordCardImpression>(app, "/api/cards/impression", async (ctx) => {
    const currentUser = assertLoggedIn(ctx);
    const cardId = assertIsKey(ctx.body.cardId);
    const timeSpent = assertIsNumber(ctx.body.timeSpent);
    const resolution = assertIsString(ctx.body.resolution);
    
    // Check that cardId is a card that exists
    const card = await ctx.db.card.findUnique({
      where: {id: cardId}
    });
    if (!card || card.deleted)
      throw new ApiErrorNotFound;
    
    await ctx.db.cardImpression.create({
      data: {
        date: new Date(),
        timeSpent, resolution, cardId,
        userId: currentUser.id,
      }
    });
    
    return {}
  });
  
  defineGetApi<ApiTypes.ApiGetCard>(app, "/api/cards/:cardId", async (ctx) => {
    const currentUser = assertLoggedIn(ctx);
    const cardId = assertIsKey(ctx.query.cardId);
    
    const card = await ctx.db.card.findUnique({where: {id: cardId}});
    if (!card || card.deleted)
      throw new ApiErrorNotFound;
    const deck = await ctx.db.deck.findUnique({where: {id: card.deckId}});
    if (!deck || deck.deleted || deck.authorId !== currentUser.id)
      throw new ApiErrorNotFound;
    
    return {
      card: apiFilterCard(card, ctx)!
    }
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
