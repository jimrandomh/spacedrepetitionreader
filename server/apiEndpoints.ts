import type {Express} from 'express';
import {addAuthEndpoints} from './api/auth';
import {addDeckEndpoints} from './api/decks';
import {addFeedEndpoints} from './api/feeds';
import {addUserEndpoints} from './api/user';

export function addApiEndpoints(app: Express) {
  addAuthEndpoints(app);
  addDeckEndpoints(app);
  addFeedEndpoints(app);
  addUserEndpoints(app);
}
