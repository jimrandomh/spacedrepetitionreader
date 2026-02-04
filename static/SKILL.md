# Spaced Repetition Reader API

Spaced Repetition Reader is a hybrid flashcard/RSS reader application. This skill enables agents to create and manage flashcards, decks, and RSS subscriptions.

## Authentication

All API endpoints require authentication. Use Bearer token authentication:

```
Authorization: Bearer <api_token>
```

To obtain an API token, log in to the web interface and generate one at `/settings`, or use the token management endpoints after initial authentication.

## Base URL

- Production: `https://spacedrepetitionreader.com`
- Local development: `http://localhost:8000`

## Common Patterns

- All responses are JSON
- IDs are CUID strings (e.g., `clq1234567890abcdef`)
- Dates are ISO 8601 strings
- Errors return `{ "error": "message" }`

---

## Token Management

### Create API Token
**POST** `/api/tokens/create`

Create a new API token for programmatic access.

**Request Body:**
```json
{
  "name": "My Agent Token"  // optional, for identification
}
```

**Response:**
```json
{
  "token": "abc123...",  // Save this! Only shown once
  "name": "My Agent Token"
}
```

### List API Tokens
**GET** `/api/tokens/list`

List all active (non-revoked) API tokens for the current user.

**Response:**
```json
{
  "tokens": [
    {
      "id": "clq...",
      "name": "My Agent Token",
      "createdAt": "2026-02-03T12:00:00.000Z",
      "lastUsedAt": "2026-02-03T15:30:00.000Z"
    }
  ]
}
```

### Revoke API Token
**POST** `/api/tokens/revoke`

Revoke an API token (cannot be undone).

**Request Body:**
```json
{
  "tokenId": "clq..."
}
```

---

## Decks

### List Decks
**GET** `/api/decks/list`

Get all decks owned by the current user.

**Response:**
```json
{
  "decks": [
    {
      "id": "clq...",
      "name": "Japanese Vocabulary",
      "authorId": "clq...",
      "config": { "reviewStatus": "active" },
      "due": 15
    }
  ]
}
```

### Get Deck
**GET** `/api/decks/:id`

Get a specific deck and its cards.

**Response:**
```json
{
  "deck": {
    "id": "clq...",
    "name": "Japanese Vocabulary",
    "authorId": "clq...",
    "config": {}
  },
  "cards": [
    {
      "id": "clq...",
      "deckId": "clq...",
      "front": "日本語",
      "back": "Japanese language"
    }
  ]
}
```

### Create Deck
**POST** `/api/decks/create`

**Request Body:**
```json
{
  "name": "New Deck"
}
```

**Response:**
```json
{
  "id": "clq..."
}
```

### Delete Deck
**POST** `/api/decks/delete`

**Request Body:**
```json
{
  "id": "clq..."
}
```

### Edit Deck Options
**POST** `/api/decks/editOptions`

**Request Body:**
```json
{
  "id": "clq...",
  "config": {
    "reviewStatus": "active"  // "active" | "paused" | "archived"
  }
}
```

---

## Cards

### Create Card
**POST** `/api/cards/create`

**Request Body:**
```json
{
  "deckId": "clq...",
  "front": "Question or prompt",
  "back": "Answer"
}
```

**Response:**
```json
{
  "id": "clq..."
}
```

### Get Card
**GET** `/api/cards/:cardId`

**Response:**
```json
{
  "card": {
    "id": "clq...",
    "deckId": "clq...",
    "front": "Question",
    "back": "Answer"
  }
}
```

### Get Card with History
**GET** `/api/cards/:cardId/history`

Get a card along with its review history.

**Response:**
```json
{
  "card": { ... },
  "history": [
    {
      "id": "clq...",
      "cardId": "clq...",
      "result": "easy",  // "easy" | "medium" | "hard" | "again"
      "date": "2026-02-03T12:00:00.000Z"
    }
  ]
}
```

### Delete Card
**POST** `/api/cards/delete`

**Request Body:**
```json
{
  "cardId": "clq..."
}
```

### Get Cards Due
**GET** `/api/cards/due`

Get all cards due for review, optionally as of a specific date.

**Query Parameters:**
- `date` (optional): ISO date string

**Response:**
```json
{
  "cards": [ ... ],
  "subscriptions": [ ... ],
  "feedItems": [ ... ],
  "notificationCards": [ ... ]
}
```

### Record Card Impression
**POST** `/api/cards/impression`

Record the result of reviewing a card.

**Request Body:**
```json
{
  "cardId": "clq...",
  "timeSpent": 5000,  // milliseconds
  "resolution": "easy",  // "easy" | "medium" | "hard" | "again"
  "date": "2026-02-03T12:00:00.000Z"  // optional, defaults to now
}
```

---

## RSS Feeds

### List Subscriptions
**GET** `/api/feeds/subscribed`

**Response:**
```json
{
  "feeds": [
    {
      "subscription": {
        "id": "clq...",
        "feedId": "clq...",
        "userId": "clq...",
        "config": { "shuffleIntoReviews": true }
      },
      "feed": {
        "id": "clq...",
        "url": "https://example.com/feed.xml",
        "title": "Example Blog"
      },
      "unreadCount": 5
    }
  ]
}
```

### Subscribe to Feed
**POST** `/api/feeds/subscribe`

**Request Body:**
```json
{
  "feedUrl": "https://example.com/feed.xml"
}
```

**Response:**
```json
{
  "feedId": "clq..."
}
```

### Unsubscribe from Feed
**POST** `/api/feeds/unsubscribe`

**Request Body:**
```json
{
  "feedId": "clq..."
}
```

### Get Unread Feed Items
**GET** `/api/feeds/:feedId/unread`

**Response:**
```json
{
  "items": [
    {
      "id": "clq...",
      "feedId": "clq...",
      "title": "New Post",
      "link": "https://example.com/post",
      "pubDate": "2026-02-03T12:00:00.000Z",
      "summary": "Post excerpt..."
    }
  ]
}
```

### Mark Feed Item as Read
**POST** `/api/feedItems/markAsRead`

**Request Body:**
```json
{
  "itemId": "clq..."
}
```

### Mark All as Read
**POST** `/api/feed/markAsRead`

Mark all items in a feed as read.

**Request Body:**
```json
{
  "feedId": "clq..."
}
```

---

## User

### Get Current User
**GET** `/api/users/whoami`

**Response:**
```json
{
  "currentUser": {
    "id": "clq...",
    "name": "username",
    "email": "user@example.com",
    "config": { ... },
    "isAdmin": false
  }
}
```

### Update User Config
**POST** `/api/users/changeConfig`

**Request Body:**
```json
{
  "config": {
    "timezone": "America/Los_Angeles",
    "emailNotifications": true
  }
}
```

---

## Example: Agent Workflow

```bash
# 1. Create a deck for notes
curl -X POST https://spacedrepetitionreader.com/api/decks/create \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Daily Learning"}'

# 2. Add a card
curl -X POST https://spacedrepetitionreader.com/api/cards/create \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "deckId": "clq...",
    "front": "What is the capital of France?",
    "back": "Paris"
  }'

# 3. Check what's due
curl https://spacedrepetitionreader.com/api/cards/due \
  -H "Authorization: Bearer $TOKEN"
```

---

## Error Handling

All endpoints may return errors in this format:

```json
{
  "error": "Error message describing what went wrong"
}
```

Common errors:
- `"Access denied"` - Not authenticated or not authorized
- `"Not found"` - Resource doesn't exist or you don't have access
- `"Argument must be a string"` - Invalid request body
