
export interface FeedEntry {
  title: string
  link: string
  pubDate: string
  summary: string
  id: string
}

export interface RestApi {
  path: string
  queryArgs: {}
  bodyArgs: {}
  responseType: {}
}

export interface ApiSignup {
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

export interface ApiLogin {
  path: "/api/users/login"
  queryArgs: {}
  bodyArgs: {
    username: string
    password: string
  }
  responseType: {
  }
}

export interface ApiLogout {
  path: "/api/users/logout"
  queryArgs: {}
  bodyArgs: {}
  responseType: {}
}

export interface ApiListDecks {
  path: "/api/decks/list"
  queryArgs: {}
  bodyArgs: {}
  responseType: {
    decks: {id: number, name: string}[]
  }
}

export interface ApiListCards {
  path: "/api/cards/list"
  queryArgs: {}
  bodyArgs: {}
  responseType: {
    //TODO
  }
}

export interface ApiCardsDue {
  path: "/api/cards/due"
  queryArgs: {}
  bodyArgs: {}
  responseType: {
    cards: {id: number, front: string, back: string}[]
  }
}

export interface ApiGetCard {
  path: "/api/cards/:cardId"
  queryArgs: {
    cardId: string
  }
  bodyArgs: {}
  responseType: {
    front: string
    back: string
  }
}

export interface ApiLoadFeed {
  path: "/api/feed/load/:feedUrl"
  queryArgs: {
    feedUrl: string
  }
  bodyArgs: {}
  responseType: {
    feedItems: any
  }
}
