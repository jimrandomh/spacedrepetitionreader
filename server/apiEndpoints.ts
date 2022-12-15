import type {Express} from 'express';
import {addAuthEndpoints} from './api/auth';
import {addDeckEndpoints} from './api/decks';
import {addFeedEndpoints} from './api/feeds';

export function addApiEndpoints(app: Express) {
  addAuthEndpoints(app);
  addDeckEndpoints(app);
  addFeedEndpoints(app);
}
