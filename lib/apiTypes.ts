export const dummy=0;

declare global {
export type DbKey = number;

module ApiTypes {

export interface ApiObjDeck { //{{_}}
  id: DbKey
  name: string
  authorId: DbKey
}

export interface ApiObjCard { //{{_}}
  id: DbKey
  deckId: DbKey
  front: string
  back: string
}

export interface ApiObjCurrentUser { //{{_}}
  id: DbKey
  name: string
  email: string
}

export interface ApiObjFeed { //{{_}}
  id: DbKey
  url: string
}

export interface FeedEntry { //{{_}}
  title: string
  link: string
  pubDate: string
  summary: string
  id: string
}


export interface RestApi { //{{_}}
  path: string
  method: string
  queryArgs: {}
  responseType: {}
}

export interface RestApiGet extends RestApi { //{{_}}
  method: "GET"
}

export interface RestApiPost extends RestApi { //{{_}}
  method: "POST"
  bodyArgs: {}
}


export interface ApiSignup extends RestApiPost { //{{_}}
  path: "/api/users/signup"
  queryArgs: {}
  bodyArgs: {
    username: string
    email: string
    password: string
  }
  responseType: {
  }
}

export interface ApiLogin extends RestApiPost { //{{_}}
  path: "/api/users/login"
  queryArgs: {}
  bodyArgs: {
    username: string
    password: string
  }
  responseType: {
  }
}

export interface ApiLogout extends RestApiPost { //{{_}}
  path: "/api/users/logout"
  queryArgs: {}
  bodyArgs: {}
  responseType: {}
}

export interface ApiWhoami extends RestApiGet { //{{_}}
  path: "/api/users/whoami"
  queryArgs: {}
  bodyArgs: {}
  responseType: {
    currentUser: ApiObjCurrentUser|null
  }
}


export interface ApiListDecks extends RestApiGet { //{{_}}
  path: "/api/decks/list"
  queryArgs: {}
  responseType: {
    decks: ApiObjDeck[]
  }
}

export interface ApiCreateDeck extends RestApiPost { //{{_}}
  path: "/api/decks/create",
  queryArgs: {},
  bodyArgs: {
    name: string,
  },
  responseType: {
    id: DbKey
  },
}

export interface ApiGetDeck extends RestApiGet { //{{_}}
  path: "/api/decks/:id"
  queryArgs: {id: DbKey}
  responseType: {
    deck: ApiObjDeck|null
    cards: ApiObjCard[]
  }
}

export interface ApiDeleteDeck extends RestApiPost { //{{_}}
  path: "/api/decks/delete",
  queryArgs: {},
  bodyArgs: {id: DbKey},
  responseType: {},
}


export interface ApiCreateCard extends RestApiPost { //{{_}}
  path: "/api/cards/create",
  queryArgs: {},
  bodyArgs: {
    deckId: DbKey
    front: string
    back: string
  }
  responseType: {
    id: DbKey
  }
}

export interface ApiListCards extends RestApiGet { //{{_}}
  path: "/api/cards/list"
  queryArgs: {}
  responseType: {
    //TODO
  }
}

export interface ApiDeleteCard extends RestApiPost { //{{_}}
  path: "/api/cards/delete"
  queryArgs: {}
  bodyArgs: {
    cardId: DbKey
  }
  responseType: {}
}

export interface ApiGetCard extends RestApiGet { //{{_}}
  path: "/api/cards/:cardId"
  queryArgs: {
    cardId: DbKey
  }
  responseType: {
    card: ApiObjCard
  }
}


export interface ApiCardsDue extends RestApiGet { //{{_}}
  path: "/api/cards/due"
  queryArgs: {}
  responseType: {
    cards: {id: DbKey, front: string, back: string}[]
  }
}

export interface ApiLoadFeed extends RestApiGet { //{{_}}
  path: "/api/feed/load/:feedUrl"
  queryArgs: {
    feedUrl: string
  }
  responseType: {
    feedItems: any
  }
}

export interface ApiRecordCardImpression extends RestApiPost { //{{_}}
  path: "/api/cards/impression"
  queryArgs: {}
  bodyArgs: {
    cardId: DbKey,
    timeSpent: number, //in milliseconds
    resolution: string,
  }
}


export interface ApiListSubscriptions extends RestApiGet { //{{_}}
  path: "/api/feeds/subscribed"
  queryArgs: {}
  responseType: {
    feeds: ApiObjFeed[]
  }
}

export interface ApiCreateFeed extends RestApiPost { //{{_}}
  path: "/api/feeds/create"
  queryArgs: {}
  bodyArgs: {
    url: string
    subscribe: boolean
  }
  responseType: {id: DbKey}
}

export interface ApiSubscribeToFeed extends RestApiPost { //{{_}}
  path: "/api/feeds/subscribe"
  queryArgs: {}
  bodyArgs: {
    feedId: DbKey
  }
  responseType: {}
}

export interface ApiUnsubscribeFromFeed extends RestApiPost { //{{_}}
  path: "/api/feeds/unsubscribe"
  queryArgs: {}
  bodyArgs: {
    feedId: DbKey
  }
  responseType: {}
}

export interface ApiGetRecentFeedItems extends RestApiGet { //{{_}}
  path: "/api/feeds/:id/recent"
  queryArgs: {id: DbKey}
  responseType: {
    items: FeedEntry[]
  }
}

export interface ApiGetUnreadFeedItems extends RestApiGet { //{{_}}
  path: "/api/feeds/:id/unread"
  queryArgs: {id: DbKey}
  responseType: {
    items: FeedEntry[]
  }
}

export interface ApiMarkFeedItemRead extends RestApiPost { //{{_}}
  path: "/api/feedItems/markAsRead"
  queryArgs: {}
  bodyArgs: {itemId: DbKey}
  responseType: {}
}

export interface ApiMarkFeedItemUnread extends RestApiPost { //{{_}}
  path: "/api/feedItems/markAsUnread"
  queryArgs: {}
  bodyArgs: {itemId: DbKey}
  responseType: {}
}

}}
