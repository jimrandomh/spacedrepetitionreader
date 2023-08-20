import { Deck, User, RssFeed } from "@prisma/client";

export function userCanViewDeck(user: User, deck: Deck) {
  return deck.authorId === user.id;
}

export function userCanEditDeck(user: User, deck: Deck) {
  return deck.authorId === user.id;
}

export function userCanViewFeed(user: User, feed: RssFeed) {
  return true;
}
