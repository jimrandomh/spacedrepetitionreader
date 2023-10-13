import type {Express} from 'express';
import { UserOptions, validateUserOptions } from '../../lib/userOptions';
import { assertLoggedIn, definePostApi } from '../serverApiUtil';

export function addUserEndpoints(app: Express) {
  definePostApi<ApiTypes.ApiChangeUserConfig>(app, "/api/users/changeConfig", async (ctx) => {
    const currentUser = assertLoggedIn(ctx);
    const changes = validateUserOptions(ctx.body.config as Partial<UserOptions>);
    const updatedConfig = {...currentUser.config as Partial<UserOptions>, ...changes};
    
    await ctx.db.user.update({
      where: { id: currentUser.id },
      data: { config: updatedConfig },
    });
    
    return {};
  });
  definePostApi<ApiTypes.ApiUpdateLastEmailOpenedAt>(app, "/api/users/emailOpened", async (ctx) => {
    const currentUser = assertLoggedIn(ctx);
    
    await ctx.db.user.update({
      where: { id: currentUser.id },
      data: {
        lastEmailOpenedAt: new Date()
      },
    });
    
    return {};
  });
}
