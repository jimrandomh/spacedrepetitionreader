import { Deck, User, RssFeed } from "@prisma/client";

export function userCanViewDeck(user: User, deck: Deck) {
  return deck.authorId === user.id;
}

export function userCanEditDeck(user: User, deck: Deck) {
  return deck.authorId === user.id;
}

export function userCanViewFeed(_user: User, _feed: RssFeed) {
  return true;
}