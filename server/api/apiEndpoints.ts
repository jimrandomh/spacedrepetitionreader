import type {Express} from 'express';
import {addAuthEndpoints} from './auth';
import {addDeckEndpoints} from './decks';
import {addFeedEndpoints} from './feeds';
import {addUserEndpoints} from './user';

export function addApiEndpoints(app: Express) {
  addAuthEndpoints(app);
  addDeckEndpoints(app);
  addFeedEndpoints(app);
  addUserEndpoints(app);
}