import type { ExportOptions, ImportedFile } from "./importTypes"
import type { DeckOptions } from "./deckOptions";
import type { SubscriptionOptions } from "./subscriptionOptions";
import type { UserOptions } from "./userOptions";

declare global {
type DbKey = string;

namespace ApiTypes {

interface ApiObjDeck { //{{_}}
  id: DbKey
  name: string
  authorId: DbKey
  config: DeckOptions
}

interface ApiObjCard { //{{_}}
  id: DbKey
  deckId: DbKey
  front: string
  back: string
}

interface ApiObjCurrentUser { //{{_}}
  id: DbKey
  name: string
  email: string
  config: UserOptions
  isAdmin: boolean
}

interface ApiObjFeed { //{{_}}
  id: DbKey
  url: string
  title: string
}

interface ApiObjSubscription { //{{_}}
  id: DbKey
  feedId: DbKey
  userId: DbKey
  config: SubscriptionOptions
}

interface ApiObjRssItem { //{{_}}
  id: DbKey
  feedId: DbKey
  title: string
  link: string
  pubDate: string
  summary: string
}

interface ApiObjCardImpression { //{{_}}
  cardId: DbKey
  id: DbKey
  result: string
  date: string
}


interface ApiObjDeckWithDueCount extends ApiObjDeck { //{{_}}
  due: number
}

interface ApiObjFeedWithUnreadCount extends ApiObjFeed { //{{_}}
  unreadCount: number
}


interface ApiObjSiteUsageStatistics { //{{_}}
  newUsersInPastWeek: number
  usersActiveInPastWeek: number
  cardsReviewedInPastWeek: number
}


interface RestApi { //{{_}}
  path: string
  method: string
  queryArgs: object
  responseType: object
}

interface RestApiGet extends RestApi { //{{_}}
  method: "GET"
}

interface RestApiPost extends RestApi { //{{_}}
  method: "POST"
  bodyArgs: object
}


interface ApiSignup extends RestApiPost { //{{_}}
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

interface ApiLogin extends RestApiPost { //{{_}}
  path: "/api/users/login"
  queryArgs: object
  bodyArgs: {
    username: string
    password: string
  }
  responseType: object
}

interface ApiLogout extends RestApiPost { //{{_}}
  path: "/api/users/logout"
  queryArgs: object
  bodyArgs: object
  responseType: object
}

interface ApiWhoami extends RestApiGet { //{{_}}
  path: "/api/users/whoami"
  queryArgs: object
  bodyArgs: object
  responseType: {
    currentUser: ApiObjCurrentUser|null
  }
}

interface ApiRequestPasswordResetEmail extends RestApiPost { //{{_}}
  path: "/api/users/requestPasswordReset",
  queryArgs: object
  bodyArgs: {
    email: string
  }
  responseType: object
}

interface ApiResetPassword extends RestApiPost { //{{_}}
  path: "/api/users/resetPassword",
  queryArgs: object
  bodyArgs: {
    token: string
    password: string
  }
  responseType: object
}

interface ApiConfirmEmail extends RestApiPost { //{{_}}
  path: "/api/users/confirmEmail",
  queryArgs: object
  bodyArgs: {
    token: string
  }
  responseType: object
}

interface ApiChangePassword extends RestApiPost { //{{_}}
  path: "/api/users/changePassword"
  queryArgs: object
  bodyArgs: {
    oldPassword: string
    newPassword: string
  }
  responseType: object
}


interface ApiChangeUserConfig extends RestApiPost { //{{_}}
  path: "/api/users/changeConfig",
  queryArgs: object
  bodyArgs: {
    config: Partial<UserOptions>
  }
  responseType: object
}


interface ApiListDecks extends RestApiGet { //{{_}}
  path: "/api/decks/list"
  queryArgs: object
  responseType: {
    decks: ApiObjDeckWithDueCount[]
  }
}

interface ApiCreateDeck extends RestApiPost { //{{_}}
  path: "/api/decks/create",
  queryArgs: object,
  bodyArgs: {
    name: string,
  },
  responseType: {
    id: DbKey
  },
}

interface ApiGetDeck extends RestApiGet { //{{_}}
  path: "/api/decks/:id"
  queryArgs: {id: DbKey}
  responseType: {
    deck: ApiObjDeck|null
    cards: ApiObjCard[]
  }
}

interface ApiDeleteDeck extends RestApiPost { //{{_}}
  path: "/api/decks/delete",
  queryArgs: object,
  bodyArgs: {id: DbKey},
  responseType: object,
}

interface ApiEditDeckOptions extends RestApiPost { //{{_}}
  path: "/api/decks/editOptions",
  queryArgs: object,
  bodyArgs: {
    id: DbKey,
    config: Partial<DeckOptions>,
  },
  responseType: object,
}

interface ApiCreateCard extends RestApiPost { //{{_}}
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

interface ApiDeleteCard extends RestApiPost { //{{_}}
  path: "/api/cards/delete"
  queryArgs: object
  bodyArgs: {
    cardId: DbKey
  }
  responseType: object
}

interface ApiGetCard extends RestApiGet { //{{_}}
  path: "/api/cards/:cardId"
  queryArgs: {
    cardId: DbKey
  }
  responseType: {
    card: ApiObjCard
  }
}

interface ApiGetCardWithHistory extends RestApiGet { //{{_}}
  path: "/api/cards/:cardId/history"
  queryArgs: {
    cardId: DbKey
  }
  responseType: {
    card: ApiObjCard,
    history: ApiObjCardImpression[],
  }
}


interface ApiCardsDue extends RestApiGet { //{{_}}
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

interface ApiOneDueCard extends RestApiGet { //{{_}}
  path: "/api/cards/oneDueCard"
  queryArgs: object
  responseType: {
    card: ApiObjCard
  }
}

interface ApiPollFeed extends RestApiGet { //{{_}}
  path: "/api/feed/poll/:feedUrl"
  queryArgs: {
    feedUrl: string
  }
  responseType: {
    feedItems: any
  }
}

interface ApiRefreshFeed extends RestApiPost { //{{_}}
  path: "/api/feed/refresh"
  queryArgs: object
  bodyArgs: {feedId: DbKey}
  responseType: object
}

interface ApiMarkAllAsRead extends RestApiPost { //{{_}}
  path: "/api/feed/markAsRead"
  queryArgs: object
  bodyArgs: {feedId: DbKey}
  responseType: object
}

interface ApiLoadFeed extends RestApiGet { //{{_}}
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

interface ApiRecordCardImpression extends RestApiPost { //{{_}}
  path: "/api/cards/impression"
  bodyArgs: {
    cardId: DbKey,
    timeSpent: number, //in milliseconds
    resolution: string,
    date?: string,
  }
}


interface ApiListSubscriptions extends RestApiGet { //{{_}}
  path: "/api/feeds/subscribed"
  queryArgs: object
  responseType: {
    feeds: ApiObjFeedWithUnreadCount[]
  }
}

interface ApiGetSuggestedSubscriptions extends RestApiGet { //{{_}}
  path: "/api/feeds/suggested"
  queryArgs: object
  responseType: {
    feeds: ApiObjFeed[]
  }
}

interface ApiSubscribeToFeed extends RestApiPost { //{{_}}
  path: "/api/feeds/subscribe"
  queryArgs: object
  bodyArgs: {
    feedUrl: string
  }
  responseType: {
    feedId: DbKey
  }
}

interface ApiUnsubscribeFromFeed extends RestApiPost { //{{_}}
  path: "/api/feeds/unsubscribe"
  queryArgs: object
  bodyArgs: {
    feedId: DbKey
  }
  responseType: object
}

interface ApiGetRecentFeedItems extends RestApiGet { //{{_}}
  path: "/api/feeds/:feedId/recent"
  queryArgs: {feedId: DbKey}
  responseType: {
    items: ApiObjRssItem[]
  }
}

interface ApiGetUnreadFeedItems extends RestApiGet { //{{_}}
  path: "/api/feeds/:feedId/unread"
  queryArgs: {feedId: DbKey}
  responseType: {
    items: ApiObjRssItem[]
  }
}

interface ApiGetFeedPreview extends RestApiGet { //{{_}}
  path: "/api/feeds/preview/:url",
  queryArgs: {url: string}
  responseType: {
    success: boolean
    url: string|null
    error: string|null
    items: ApiObjRssItem[]
  }
}

interface ApiMarkFeedItemRead extends RestApiPost { //{{_}}
  path: "/api/feedItems/markAsRead"
  queryArgs: object
  bodyArgs: {itemId: DbKey}
  responseType: object
}

interface ApiEditSubscriptionOptions extends RestApiPost { //{{_}}
  path: "/api/feeds/edit",
  queryArgs: object
  bodyArgs: {
    subscriptionId: DbKey
    config: Partial<SubscriptionOptions>
  },
  responseType: object
}


interface ApiUploadForImport extends RestApiPost { //{{_}}
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

interface ApiConfirmImport extends RestApiPost { //{{_}}
  path: "/api/confirmImport",
  queryArgs: object,
  bodyArgs: {
    fileId: string
  },
  responseType: {
    deckId: string
  }
}

interface ApiExportDeck extends RestApiPost { //{{_}}
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


interface ApiAdminUsageStatistics extends RestApiGet { //{{_}}
  path: "/api/admin/usageStatistics",
  queryArgs: object,
  responseType: {
    statistics: ApiObjSiteUsageStatistics,
  }
}

interface ApiForceSendCardsDueEmail extends RestApiPost { //{{_}}
  path: "/api/debug/sendCardsDueEmail",
  queryArgs: object,
  bodyArgs: object,
  responseType: object,
}

}}
