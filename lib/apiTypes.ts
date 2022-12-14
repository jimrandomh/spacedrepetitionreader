
export interface FeedEntry {
  title: string
  link: string
  pubDate: string
  summary: string
  id: string
}

export interface RestApi {
  path: string
  method: string
  queryArgs: {}
  responseType: {}
}

export interface RestApiGet extends RestApi {
  method: "GET"
}

export interface RestApiPost extends RestApi {
  method: "POST"
  bodyArgs: {}
}

export interface ApiSignup extends RestApiPost {
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

export interface ApiLogin extends RestApiPost {
  path: "/api/users/login"
  queryArgs: {}
  bodyArgs: {
    username: string
    password: string
  }
  responseType: {
  }
}

export interface ApiLogout extends RestApiPost {
  path: "/api/users/logout"
  queryArgs: {}
  bodyArgs: {}
  responseType: {}
}

export interface ApiListDecks extends RestApiGet {
  path: "/api/decks/list"
  queryArgs: {}
  responseType: {
    decks: {id: number, name: string}[]
  }
}

export interface ApiCreateDeck extends RestApiPost {
  path: "/api/decks/create",
  queryArgs: {},
  bodyArgs: {
    name: string,
  },
  responseType: {
    id: number
  },
}

export interface ApiListCards extends RestApiGet {
  path: "/api/cards/list"
  queryArgs: {}
  responseType: {
    //TODO
  }
}

export interface ApiCardsDue extends RestApiGet {
  path: "/api/cards/due"
  queryArgs: {}
  responseType: {
    cards: {id: number, front: string, back: string}[]
  }
}

export interface ApiGetCard extends RestApiGet {
  path: "/api/cards/:cardId"
  queryArgs: {
    cardId: string
  }
  responseType: {
    front: string
    back: string
  }
}

export interface ApiLoadFeed extends RestApiGet {
  path: "/api/feed/load/:feedUrl"
  queryArgs: {
    feedUrl: string
  }
  responseType: {
    feedItems: any
  }
}
