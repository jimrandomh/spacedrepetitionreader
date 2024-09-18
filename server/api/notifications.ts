import type {Express} from 'express';
import { assertIsBoolean, assertIsString, assertLoggedIn, definePostApi } from "../serverApiUtil";

export function addNotificationEndpoints(app: Express) {
  definePostApi<ApiTypes.ApiNotificationSeen>(app, "/api/notifications/seen", async (ctx) => {
    const currentUser = assertLoggedIn(ctx);
    const notificationType = assertIsString(ctx.body.notificationType);

    switch (notificationType) {
      case "feedbackRequest":
        await ctx.db.user.update({
          where: {id: currentUser.id},
          data: {
            feedbackRequestLastShown: new Date(),
          },
        });
        break;
      default:
        break;
    }
    return {};
  });

  definePostApi<ApiTypes.ApiDismissNotification>(app, "/api/notifications/dismiss", async (ctx) => {
    const currentUser = assertLoggedIn(ctx);
    const notificationType = assertIsString(ctx.body.notificationType);
    const dontShowAgain = assertIsBoolean(ctx.body.dontShowAgain);
    
    switch (notificationType) {
      case "feedbackRequest":
        await ctx.db.user.update({
          where: {id: currentUser.id},
          data: {
            feedbackDontShowAgain: dontShowAgain,
          },
        });
        break;
      default:
        break;
    }
    return {};
  });
}
