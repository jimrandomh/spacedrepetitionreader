import type { Express } from 'express';
import { assertLoggedInAdmin, defineGetApi } from '../serverApiUtil';

export function addAdminEndpoints(app: Express) {
  defineGetApi<ApiTypes.ApiAdminUsageStatistics>(app, "/api/admin/usageStatistics", async (ctx) => {
    const _currentUser = assertLoggedInAdmin(ctx);
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - (7*24*60*60*1000));
    
    const newUsersInPastWeek = await ctx.db.user.count({
      where: {
        createdAt: { gte: oneWeekAgo },
      },
    });
    const usersActiveInPastWeek = await ctx.db.user.count({
      where: {
        lastVisitAt: { gte: oneWeekAgo },
      },
    });
    const cardsReviewedInPastWeek = await ctx.db.cardImpression.count({
      where: {
        date: { gte: oneWeekAgo },
      }
    });
    
    return {
      statistics: {
        newUsersInPastWeek,
        usersActiveInPastWeek,
        cardsReviewedInPastWeek,
      }
    };
  });
}
