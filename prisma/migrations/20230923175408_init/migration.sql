-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "lastRemindedAt" TIMESTAMP(3),
    "config" JSONB NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoginToken" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "valid" BOOLEAN NOT NULL DEFAULT true,
    "ownerId" TEXT NOT NULL,

    CONSTRAINT "LoginToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailToken" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usedAt" TIMESTAMP(3),
    "type" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "EmailToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Deck" (
    "id" TEXT NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "config" JSONB NOT NULL DEFAULT '{}',
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "authorId" TEXT NOT NULL,

    CONSTRAINT "Deck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Card" (
    "id" TEXT NOT NULL,
    "front" TEXT NOT NULL,
    "back" TEXT NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deckId" TEXT NOT NULL,

    CONSTRAINT "Card_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CardImpression" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "timeSpent" DOUBLE PRECISION NOT NULL,
    "resolution" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,

    CONSTRAINT "CardImpression_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CardDueDate" (
    "id" TEXT NOT NULL,
    "due" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,

    CONSTRAINT "CardDueDate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RssSubscription" (
    "id" TEXT NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "config" JSONB NOT NULL,
    "userId" TEXT NOT NULL,
    "feedId" TEXT NOT NULL,

    CONSTRAINT "RssSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RssFeed" (
    "id" TEXT NOT NULL,
    "rssUrl" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT '',
    "lastSync" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RssFeed_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RssItem" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "pubDate" TIMESTAMP(3) NOT NULL,
    "remoteId" TEXT NOT NULL,
    "feedId" TEXT NOT NULL,

    CONSTRAINT "RssItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RssImpression" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rssItemId" TEXT NOT NULL,

    CONSTRAINT "RssImpression_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CronHistory" (
    "key" TEXT NOT NULL,
    "intendedAt" BIGINT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "finishedAt" TIMESTAMP(3),
    "error" TEXT,

    CONSTRAINT "CronHistory_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "FileUpload" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "sha256sum" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uploadType" TEXT NOT NULL,
    "importFinished" BOOLEAN NOT NULL DEFAULT false,
    "uploaderUserId" TEXT NOT NULL,

    CONSTRAINT "FileUpload_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UploadedFileBody" (
    "sha256sum" TEXT NOT NULL,
    "contents" BYTEA NOT NULL,

    CONSTRAINT "UploadedFileBody_pkey" PRIMARY KEY ("sha256sum")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_name_key" ON "User"("name");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_name_idx" ON "User"("name");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "LoginToken_tokenHash_key" ON "LoginToken"("tokenHash");

-- CreateIndex
CREATE INDEX "LoginToken_tokenHash_idx" ON "LoginToken"("tokenHash");

-- CreateIndex
CREATE UNIQUE INDEX "EmailToken_tokenHash_key" ON "EmailToken"("tokenHash");

-- CreateIndex
CREATE INDEX "EmailToken_tokenHash_idx" ON "EmailToken"("tokenHash");

-- CreateIndex
CREATE INDEX "Deck_authorId_idx" ON "Deck"("authorId");

-- CreateIndex
CREATE INDEX "Card_deckId_idx" ON "Card"("deckId");

-- CreateIndex
CREATE INDEX "CardImpression_userId_idx" ON "CardImpression"("userId");

-- CreateIndex
CREATE INDEX "CardImpression_cardId_idx" ON "CardImpression"("cardId");

-- CreateIndex
CREATE INDEX "CardDueDate_userId_due_idx" ON "CardDueDate"("userId", "due");

-- CreateIndex
CREATE INDEX "CardDueDate_cardId_userId_idx" ON "CardDueDate"("cardId", "userId");

-- CreateIndex
CREATE INDEX "RssSubscription_userId_idx" ON "RssSubscription"("userId");

-- CreateIndex
CREATE INDEX "RssSubscription_feedId_idx" ON "RssSubscription"("feedId");

-- CreateIndex
CREATE UNIQUE INDEX "RssFeed_rssUrl_key" ON "RssFeed"("rssUrl");

-- CreateIndex
CREATE INDEX "RssFeed_rssUrl_idx" ON "RssFeed"("rssUrl");

-- CreateIndex
CREATE INDEX "RssItem_feedId_pubDate_idx" ON "RssItem"("feedId", "pubDate");

-- CreateIndex
CREATE INDEX "RssImpression_userId_rssItemId_idx" ON "RssImpression"("userId", "rssItemId");

-- CreateIndex
CREATE INDEX "FileUpload_sha256sum_idx" ON "FileUpload"("sha256sum");

-- CreateIndex
CREATE INDEX "FileUpload_uploaderUserId_idx" ON "FileUpload"("uploaderUserId");

-- AddForeignKey
ALTER TABLE "LoginToken" ADD CONSTRAINT "LoginToken_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailToken" ADD CONSTRAINT "EmailToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deck" ADD CONSTRAINT "Deck_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Card" ADD CONSTRAINT "Card_deckId_fkey" FOREIGN KEY ("deckId") REFERENCES "Deck"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardImpression" ADD CONSTRAINT "CardImpression_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardImpression" ADD CONSTRAINT "CardImpression_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardDueDate" ADD CONSTRAINT "CardDueDate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardDueDate" ADD CONSTRAINT "CardDueDate_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RssSubscription" ADD CONSTRAINT "RssSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RssSubscription" ADD CONSTRAINT "RssSubscription_feedId_fkey" FOREIGN KEY ("feedId") REFERENCES "RssFeed"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RssItem" ADD CONSTRAINT "RssItem_feedId_fkey" FOREIGN KEY ("feedId") REFERENCES "RssFeed"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RssImpression" ADD CONSTRAINT "RssImpression_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RssImpression" ADD CONSTRAINT "RssImpression_rssItemId_fkey" FOREIGN KEY ("rssItemId") REFERENCES "RssItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileUpload" ADD CONSTRAINT "FileUpload_uploaderUserId_fkey" FOREIGN KEY ("uploaderUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
