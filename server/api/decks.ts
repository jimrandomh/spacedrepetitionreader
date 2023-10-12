import type { Express } from 'express';
import type { Card, CardImpression, CardRevision, Deck, RssFeed, RssItem, RssSubscription, User } from '@prisma/client'
import { defineGetApi, definePostApi, assertLoggedIn, assertIsKey, assertIsNumber, assertIsString, ServerApiContext, ApiErrorNotFound, ApiErrorAccessDenied } from '../serverApiUtil';
import { getUnreadItems } from './feeds';
import { getDueDate } from '../cardScheduler';
import flatten from 'lodash/flatten';
import filter from 'lodash/filter';
import { apiFilterRssItem, apiFilterSubscription, userCanEditDeck, userCanViewDeck } from '../permissions';
import { awaitAll } from '../../lib/util/asyncUtil';
import { maybeRefreshFeed } from '../feeds/feedSync';
import { DeckOptions, getDeckOptions, validateDeckOptions } from '../../lib/deckOptions';
import { getSubscriptionOptions } from '../../lib/subscriptionOptions';
import some from 'lodash/some';
import shuffle from 'lodash/shuffle';
import take from 'lodash/take';

const maxParallelism = 10;

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
      decks: decks
        .filter(deck => userCanViewDeck(currentUser, deck))
        .map(deck => {
          return {
            ...apiFilterDeck(deck, ctx),
            due: 0, //TODO
          };
        })
    }
  });

  definePostApi<ApiTypes.ApiCreateDeck>(app, "/api/decks/create", async (ctx) => {
    const currentUser = assertLoggedIn(ctx);
    const name = assertIsString(ctx.body.name);

    const deck = await ctx.db.deck.create({
      data: {
        name,
        description: "",
        authorId: currentUser.id,
        deleted: false,
        config: {},
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
      where: { id: deckId }
    });
    if (!deck) {
      throw new ApiErrorNotFound;
    }
    if (!userCanEditDeck(currentUser, deck)) {
      throw new ApiErrorAccessDenied;
    }

    await ctx.db.deck.update({
      where: { id: deckId },
      data: { deleted: true }
    });

    return {};
  });

  definePostApi<ApiTypes.ApiEditDeckOptions>(app, "/api/decks/editOptions", async (ctx) => {
    const currentUser = assertLoggedIn(ctx);
    const deckId = assertIsKey(ctx.body.id);
    const config = validateDeckOptions(ctx.body.config);

    const deck = await ctx.db.deck.findUnique({
      where: { id: deckId }
    });
    if (!deck) {
      throw new ApiErrorNotFound;
    }
    if (!userCanEditDeck(currentUser, deck)) {
      throw new ApiErrorAccessDenied();
    }

    await ctx.db.deck.update({
      where: { id: deckId },
      data: {
        config: { ...deck.config as Partial<DeckOptions>, ...config },
      },
    });

    return {};
  });

  defineGetApi<ApiTypes.ApiGetDeck>(app, "/api/decks/:id", async (ctx) => {
    const currentUser = assertLoggedIn(ctx);
    const id = assertIsKey(ctx.query.id);

    const deck = await ctx.db.deck.findFirst({
      where: { id, authorId: currentUser.id, deleted: false }
    });
    if (!deck) {
      throw new ApiErrorNotFound;
    }
    if (!userCanViewDeck(currentUser, deck)) {
      throw new ApiErrorAccessDenied;
    }

    const cards = await ctx.db.card.findMany({
      where: { deleted: false, deckId: id },
      include: { activeRevision: true },
    });

    return {
      deck: apiFilterDeck(deck, ctx),
      cards: cards.map(card => apiFilterCard(card, card.activeRevision!, ctx)),
    };
  });


  definePostApi<ApiTypes.ApiCreateCard>(app, "/api/cards/create", async (ctx) => {
    const currentUser = assertLoggedIn(ctx);
    const deckId = assertIsKey(ctx.body.deckId);
    const front = assertIsString(ctx.body.front);
    const back = assertIsString(ctx.body.back);

    // Check that deckId is valid
    const deck = await ctx.db.deck.findUnique({ where: { id: deckId } });
    if (!deck || deck.deleted) throw new ApiErrorNotFound;

    // Check that the deck is owned by the right user
    if (!userCanEditDeck(currentUser, deck)) {
      throw new ApiErrorAccessDenied;
    }

    const card = await ctx.db.card.create({
      data: {
        deckId, 
        AllRevisions: {
          createMany: {
            data: [{
              userId: currentUser.id,
              front,
              back
            }]
          }
        },
        deleted: false,
      },
      include: {
        AllRevisions: true,
      }
    });

    await ctx.db.card.update({
      where: {
        id: card.id,
      },
      data: {
        activeRevisionId: card.AllRevisions[0].id
      }
    });

    return { id: card.id };
  });

  definePostApi<ApiTypes.ApiDeleteCard>(app, "/api/cards/delete", async (ctx) => {
    const currentUser = assertLoggedIn(ctx);
    const cardId = assertIsKey(ctx.body.cardId);

    const card = await ctx.db.card.findUnique({ where: { id: cardId } });
    if (!card || card.deleted) {
      throw new ApiErrorNotFound;
    }
    const deck = await ctx.db.deck.findUnique({ where: { id: card.deckId } });
    if (!deck || deck.deleted) {
      throw new ApiErrorNotFound;
    }
    if (!userCanEditDeck(currentUser, deck)) {
      throw new ApiErrorAccessDenied;
    }

    await ctx.db.card.update({
      where: { id: cardId },
      data: { deleted: true }
    });

    return {};
  });


  defineGetApi<ApiTypes.ApiCardsDue>(app, "/api/cards/due", async (ctx) => {
    const currentUser = assertLoggedIn(ctx);
    const dateStr = ctx.searchParams.get('date');
    const now = dateStr ? new Date(dateStr) : new Date();
    return await getItemsDue({
      currentUser, ctx, now
    });
  });

  defineGetApi<ApiTypes.ApiOneDueCard>(app, "/api/cards/oneDueCard", async (ctx) => {
    const currentUser = assertLoggedIn(ctx);
    const now = new Date();

    const itemsDue = await getItemsDue({
      currentUser, ctx, now,
      maxCards: 1,
      includeRss: false,
    });

    return {
      card: itemsDue.cards[0]
    };
  });

  definePostApi<ApiTypes.ApiRecordCardImpression>(app, "/api/cards/impression", async (ctx) => {
    const currentUser = assertLoggedIn(ctx);
    const cardId = assertIsKey(ctx.body.cardId);
    const timeSpent = assertIsNumber(ctx.body.timeSpent);
    const resolution = assertIsString(ctx.body.resolution);
    const now = ctx.body.date ? new Date(ctx.body.date) : new Date();

    // Check that cardId is a card that exists
    const card = await ctx.db.card.findUnique({
      where: { id: cardId }
    });
    if (!card || card.deleted) {
      throw new ApiErrorNotFound;
    }

    await ctx.db.cardImpression.create({
      data: {
        date: now,
        timeSpent, resolution, cardId,
        userId: currentUser.id,
      }
    });

    return {}
  });

  defineGetApi<ApiTypes.ApiGetCardWithHistory>(app, "/api/cards/:cardId/history", async (ctx) => {
    const currentUser = assertLoggedIn(ctx);
    const cardId = assertIsKey(ctx.query.cardId);
    
    const card = await ctx.db.card.findUnique({ where: { id: cardId }, include: { activeRevision: true } });
    const history = await ctx.db.cardImpression.findMany({ where: { cardId: cardId }});
    if (!card || card.deleted) {
      throw new ApiErrorNotFound;
    }
    const deck = await ctx.db.deck.findUnique({ where: { id: card.deckId } });
    if (!deck || deck.deleted) {
      throw new ApiErrorNotFound;
    }
    if (!userCanViewDeck(currentUser, deck)) {
      throw new ApiErrorAccessDenied;
    }
    return {
      card: apiFilterCard(card, card.activeRevision!, ctx),
      history: history.map(apiFilterImpression),
    }
  })
  defineGetApi<ApiTypes.ApiGetCard>(app, "/api/cards/:cardId", async (ctx) => {
    const currentUser = assertLoggedIn(ctx);
    const cardId = assertIsKey(ctx.query.cardId);

    const card = await ctx.db.card.findUnique({ where: { id: cardId }, include: { activeRevision: true } });
    if (!card || card.deleted) {
      throw new ApiErrorNotFound;
    }
    const deck = await ctx.db.deck.findUnique({ where: { id: card.deckId } });
    if (!deck || deck.deleted) {
      throw new ApiErrorNotFound;
    }
    if (!userCanViewDeck(currentUser, deck)) {
      throw new ApiErrorAccessDenied;
    }

    return {
      card: apiFilterCard(card, card.activeRevision!, ctx)
    }
  });
}

export async function getItemsDue({ currentUser, ctx, now, maxCards, includeRss = true }: {
  currentUser: User,
  ctx: ServerApiContext,
  now: Date,
  maxCards?: number
  includeRss?: boolean,
}) {
  // Get decks owned by this user, and filter by active review status
  const allDecks = await ctx.db.deck.findMany({
    where: {
      deleted: false,
      authorId: currentUser.id,
    },
  });

  const activeDecks = allDecks.filter(deck => getDeckOptions(deck).reviewStatus === "active");

  // Get decks owned by this user, cards in those decks, and impressions by this user on those cards.
  const decksWithCards = await ctx.db.deck.findMany({
    where: {
      id: { in: activeDecks.map(d => d.id) },
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
          },
          activeRevision: true,
        }
      }
    }
  });

  // Compute a due date for each card
  const cards = flatten(decksWithCards.map(deck => deck.cards));
  let cardsDue = filter(cards, card => {
    const dueDate = getDueDate(card, card.impressions, ctx);
    return dueDate <= now;
  });

  if (maxCards !== undefined) {
    cardsDue = take(shuffle(cardsDue), maxCards);
  }

  let subscriptionsToCheck: (RssSubscription & { feed: RssFeed })[] = [];
  let unreadItems: RssItem[] = [];
  if (includeRss) {
    // Get the user's RSS subscriptions
    const subscriptions = await ctx.db.rssSubscription.findMany({
      where: {
        userId: currentUser.id,
        deleted: false,
      },
      include: { feed: true }
    });

    // Filter RSS subscriptions based on the include-in-reviews config setting
    subscriptionsToCheck = subscriptions.filter(sub => getSubscriptionOptions(sub).shuffleIntoReviews);

    // Refresh any RSS feeds that are stale
    await awaitAll(subscriptionsToCheck.map(subscription => async () => {
      await maybeRefreshFeed(subscription.feed, ctx.db)
    }), maxParallelism);

    // Get unread items in the user's RSS feeds
    unreadItems = flatten(
      await awaitAll(
        subscriptionsToCheck.map(subscription => async () => {
          return await getUnreadItems(currentUser, subscription.feed, ctx.db);
        }),
        maxParallelism
      )
    );
  }

  const subscriptionsToInclude = subscriptionsToCheck.filter(sub => some(unreadItems, item => item.feedId === sub.feedId));

  // Return cards that are due ad unread feed items
  return {
    cards: cardsDue.map(card => apiFilterCard(card, card.activeRevision!, ctx)),
    subscriptions: subscriptionsToInclude.map(sub => apiFilterSubscription(sub, ctx)),
    feedItems: unreadItems.map(item => apiFilterRssItem(item, ctx)),
  };
}

function apiFilterDeck(deck: Deck, _ctx: ServerApiContext): ApiTypes.ApiObjDeck {
  return {
    id: deck.id,
    name: deck.name,
    authorId: deck.authorId,
    config: getDeckOptions(deck),
  }
}

function apiFilterCard(card: Card, revision: CardRevision, _ctx: ServerApiContext): ApiTypes.ApiObjCard {
  return {
    id: card.id,
    deckId: card.deckId,
    front: revision.front,
    back: revision.back,
  };
}

function apiFilterImpression(impression: CardImpression): ApiTypes.ApiObjCardImpression {
  return {
    cardId: impression.cardId,
    id: impression.id,
    result: impression.resolution,
    date: impression.date.toISOString(),
  };
}


