
export interface ApiObjDeck { //{{_}}
  id: number
  name: string
  authorId: number
}

export interface ApiObjCard { //{{_}}
  id: number
  deckId: number
  front: string
  back: string
}

export interface ApiObjCurrentUser { //{{_}}
  id: number
  name: string
  email: string
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
    id: number
  },
}

export interface ApiGetDeck extends RestApiGet { //{{_}}
  path: "/api/decks/:id"
  queryArgs: {id: number}
  responseType: {
    deck: ApiObjDeck|null
    cards: ApiObjCard[]
  }
}

export interface ApiDeleteDeck extends RestApiPost { //{{_}}
  path: "/api/decks/delete",
  queryArgs: {},
  bodyArgs: {
    id: number
  },
  responseType: {},
}


export interface ApiCreateCard extends RestApiPost { //{{_}}
  path: "/api/cards/create",
  queryArgs: {},
  bodyArgs: {
    deckId: number
    front: string
    back: string
  }
  responseType: {
    id: number
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
    cardId: number
  }
  responseType: {}
}

export interface ApiGetCard extends RestApiGet { //{{_}}
  path: "/api/cards/:cardId"
  queryArgs: {
    cardId: number
  }
  responseType: {
    card: ApiObjCard
  }
}


export interface ApiCardsDue extends RestApiGet { //{{_}}
  path: "/api/cards/due"
  queryArgs: {}
  responseType: {
    cards: {id: number, front: string, back: string}[]
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
