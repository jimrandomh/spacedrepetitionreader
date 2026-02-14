import type { Express } from 'express';
import { defineGetApi, assertLoggedIn } from '../serverApiUtil';
import { getDeckOptions } from '../../lib/deckOptions';
import { getDueDate } from '../cardScheduler';

export function addStatsEndpoints(app: Express) {
  defineGetApi<ApiTypes.ApiReviewStatus>(app, "/api/stats/reviewStatus", async (ctx) => {
    const currentUser = assertLoggedIn(ctx);
    const now = new Date();

    // Get active decks
    const allDecks = await ctx.db.deck.findMany({
      where: {
        deleted: false,
        authorId: currentUser.id,
      },
    });
    const activeDecks = allDecks.filter(deck => getDeckOptions(deck).reviewStatus === "active");

    // Get cards in active decks with their impressions
    const decksWithCards = await ctx.db.deck.findMany({
      where: {
        id: { in: activeDecks.map(d => d.id) },
      },
      include: {
        cards: {
          where: { deleted: false },
          include: {
            impressions: {
              where: { userId: currentUser.id }
            }
          }
        }
      }
    });

    // Count cards that are due
    let cardsDue = 0;
    for (const deck of decksWithCards) {
      for (const card of deck.cards) {
        const dueDate = getDueDate(card, card.impressions, ctx);
        if (dueDate <= now) {
          cardsDue++;
        }
      }
    }

    // Get the most recent impression (last review)
    const lastImpression = await ctx.db.cardImpression.findFirst({
      where: { userId: currentUser.id },
      orderBy: { date: 'desc' },
    });

    // Get total cards reviewed today
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    
    const reviewsToday = await ctx.db.cardImpression.count({
      where: {
        userId: currentUser.id,
        date: { gte: startOfDay },
      },
    });

    return {
      cardsDue,
      lastReviewAt: lastImpression?.date.toISOString() ?? null,
      reviewsToday,
      activeDecks: activeDecks.length,
    };
  });
}
