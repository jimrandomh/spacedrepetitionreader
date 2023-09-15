import type { ExportOptions, ImportedFile } from "./importTypes"
import type { DeckOptions } from "./deckOptions";
import type { SubscriptionOptions } from "./subscriptionOptions";
import type { UserOptions } from "./userOptions";

export const dummy=0;

declare global {
export type DbKey = string;

namespace ApiTypes {

export interface ApiObjDeck { //{{_}}
  id: DbKey
  name: string
  authorId: DbKey
  config: DeckOptions
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
  config: UserOptions
}

export interface ApiObjFeed { //{{_}}
  id: DbKey
  url: string
  title: string
}

export interface ApiObjSubscription { //{{_}}
  id: DbKey
  feedId: DbKey
  userId: DbKey
  config: SubscriptionOptions
}

export interface ApiObjRssItem { //{{_}}
  id: DbKey
  feedId: DbKey
  title: string
  link: string
  pubDate: string
  summary: string
}


export interface ApiObjDeckWithDueCount extends ApiObjDeck { //{{_}}
  due: number
}

export interface ApiObjFeedWithUnreadCount extends ApiObjFeed { //{{_}}
  unreadCount: number
}


export interface RestApi { //{{_}}
  path: string
  method: string
  queryArgs: object
  responseType: object
}

export interface RestApiGet extends RestApi { //{{_}}
  method: "GET"
}

export interface RestApiPost extends RestApi { //{{_}}
  method: "POST"
  bodyArgs: object
}


export interface ApiSignup extends RestApiPost { //{{_}}
  path: "/api/users/signup"
  queryArgs: object
  bodyArgs: {
    username: string
    email: string
    password: string
    timezone: string
  }
  responseType: object
}

export interface ApiLogin extends RestApiPost { //{{_}}
  path: "/api/users/login"
  queryArgs: object
  bodyArgs: {
    username: string
    password: string
  }
  responseType: object
}

export interface ApiLogout extends RestApiPost { //{{_}}
  path: "/api/users/logout"
  queryArgs: object
  bodyArgs: object
  responseType: object
}

export interface ApiWhoami extends RestApiGet { //{{_}}
  path: "/api/users/whoami"
  queryArgs: object
  bodyArgs: object
  responseType: {
    currentUser: ApiObjCurrentUser|null
  }
}

export interface ApiRequestPasswordResetEmail extends RestApiPost { //{{_}}
  path: "/api/users/requestPasswordReset",
  queryArgs: object
  bodyArgs: {
    email: string
  }
  responseType: object
}

export interface ApiResetPassword extends RestApiPost { //{{_}}
  path: "/api/users/resetPassword",
  queryArgs: object
  bodyArgs: {
    token: string
    password: string
  }
  responseType: object
}

export interface ApiConfirmEmail extends RestApiPost { //{{_}}
  path: "/api/users/confirmEmail",
  queryArgs: object
  bodyArgs: {
    token: string
  }
  responseType: object
}

export interface ApiChangePassword extends RestApiPost { //{{_}}
  path: "/api/users/changePassword"
  queryArgs: object
  bodyArgs: {
    oldPassword: string
    newPassword: string
  }
  responseType: object
}


export interface ApiChangeUserConfig extends RestApiPost { //{{_}}
  path: "/api/users/changeConfig",
  queryArgs: object
  bodyArgs: {
    config: Partial<UserOptions>
  }
  responseType: object
}


export interface ApiListDecks extends RestApiGet { //{{_}}
  path: "/api/decks/list"
  queryArgs: object
  responseType: {
    decks: ApiObjDeckWithDueCount[]
  }
}

export interface ApiCreateDeck extends RestApiPost { //{{_}}
  path: "/api/decks/create",
  queryArgs: object,
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
  queryArgs: object,
  bodyArgs: {id: DbKey},
  responseType: object,
}

export interface ApiEditDeckOptions extends RestApiPost { //{{_}}
  path: "/api/decks/editOptions",
  queryArgs: object,
  bodyArgs: {
    id: DbKey,
    config: Partial<DeckOptions>,
  },
  responseType: object,
}

export interface ApiCreateCard extends RestApiPost { //{{_}}
  path: "/api/cards/create",
  queryArgs: object,
  bodyArgs: {
    deckId: DbKey
    front: string
    back: string
  }
  responseType: {
    id: DbKey
  }
}

export interface ApiDeleteCard extends RestApiPost { //{{_}}
  path: "/api/cards/delete"
  queryArgs: object
  bodyArgs: {
    cardId: DbKey
  }
  responseType: object
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
  queryArgs: {
    date?: string
  }
  responseType: {
    cards: ApiObjCard[]
    subscriptions: ApiObjSubscription[]
    feedItems: ApiObjRssItem[]
  }
}

export interface ApiOneDueCard extends RestApiGet { //{{_}}
  path: "/api/cards/oneDueCard"
  queryArgs: object
  responseType: {
    card: ApiObjCard
  }
}

export interface ApiPollFeed extends RestApiGet { //{{_}}
  path: "/api/feed/poll/:feedUrl"
  queryArgs: {
    feedUrl: string
  }
  responseType: {
    feedItems: any
  }
}

export interface ApiRefreshFeed extends RestApiPost { //{{_}}
  path: "/api/feed/refresh"
  queryArgs: object
  bodyArgs: {feedId: DbKey}
  responseType: object
}

export interface ApiMarkAllAsRead extends RestApiPost { //{{_}}
  path: "/api/feed/markAsRead"
  queryArgs: object
  bodyArgs: {feedId: DbKey}
  responseType: object
}

export interface ApiLoadFeed extends RestApiGet { //{{_}}
  path: "/api/feed/load/:feedId"
  queryArgs: {
    feedId: DbKey
  }
  responseType: {
    feed: ApiObjFeed
    subscription: ApiObjSubscription|null,
    feedItems: ApiObjRssItem[]
  }
}

export interface ApiRecordCardImpression extends RestApiPost { //{{_}}
  path: "/api/cards/impression"
  bodyArgs: {
    cardId: DbKey,
    timeSpent: number, //in milliseconds
    resolution: string,
    date?: string,
  }
}


export interface ApiListSubscriptions extends RestApiGet { //{{_}}
  path: "/api/feeds/subscribed"
  queryArgs: object
  responseType: {
    feeds: ApiObjFeedWithUnreadCount[]
  }
}

export interface ApiSubscribeToFeed extends RestApiPost { //{{_}}
  path: "/api/feeds/subscribe"
  queryArgs: object
  bodyArgs: {
    feedUrl: string
  }
  responseType: {
    feedId: DbKey
  }
}

export interface ApiUnsubscribeFromFeed extends RestApiPost { //{{_}}
  path: "/api/feeds/unsubscribe"
  queryArgs: object
  bodyArgs: {
    feedId: DbKey
  }
  responseType: object
}

export interface ApiGetRecentFeedItems extends RestApiGet { //{{_}}
  path: "/api/feeds/:feedId/recent"
  queryArgs: {feedId: DbKey}
  responseType: {
    items: ApiObjRssItem[]
  }
}

export interface ApiGetUnreadFeedItems extends RestApiGet { //{{_}}
  path: "/api/feeds/:feedId/unread"
  queryArgs: {feedId: DbKey}
  responseType: {
    items: ApiObjRssItem[]
  }
}

export interface ApiGetFeedPreview extends RestApiGet { //{{_}}
  path: "/api/feeds/preview/:url",
  queryArgs: {url: string}
  responseType: {
    success: boolean
    url: string|null
    error: string|null
    items: ApiObjRssItem[]
  }
}

export interface ApiMarkFeedItemRead extends RestApiPost { //{{_}}
  path: "/api/feedItems/markAsRead"
  queryArgs: object
  bodyArgs: {itemId: DbKey}
  responseType: object
}

export interface ApiEditSubscriptionOptions extends RestApiPost { //{{_}}
  path: "/api/feeds/edit",
  queryArgs: object
  bodyArgs: {
    subscriptionId: DbKey
    config: Partial<SubscriptionOptions>
  },
  responseType: object
}


export interface ApiUploadForImport extends RestApiPost { //{{_}}
  path: "/api/uploadForImport",
  queryArgs: object,
  bodyArgs: {
    fileName: string
    fileContents: string,
  },
  responseType: {
    importFileId: string
    preview: ImportedFile
  }
}

export interface ApiConfirmImport extends RestApiPost { //{{_}}
  path: "/api/confirmImport",
  queryArgs: object,
  bodyArgs: {
    fileId: string
  },
  responseType: {
    deckId: string
  }
}

export interface ApiExportDeck extends RestApiPost { //{{_}}
  path: "/api/exportDeck",
  queryArgs: object,
  bodyArgs: {
    deckId: string
    options: ExportOptions
  },
  responseType: {
    downloadId: string
  }
}

}}
