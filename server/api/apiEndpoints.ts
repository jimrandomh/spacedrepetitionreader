import type {Express} from 'express';
import {addAuthEndpoints} from './auth';
import {addDeckEndpoints} from './decks';
import {addFeedEndpoints} from './feeds';
import {addImportEndpoints} from './import';
import {addUserEndpoints} from './user';
import {addAdminEndpoints} from './admin';
import { addNotificationEndpoints } from './notifications';

export function addApiEndpoints(app: Express) {
  addAuthEndpoints(app);
  addDeckEndpoints(app);
  addFeedEndpoints(app);
  addUserEndpoints(app);
  addImportEndpoints(app);
  addAdminEndpoints(app);
  addNotificationEndpoints(app);
}
