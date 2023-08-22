import React from 'react';
import { User } from "@prisma/client";
import { getUserOptions } from "../lib/userOptions";
import { getItemsDue } from "./api/decks";
import { getPrisma } from "./db";
import { sendEmail } from "./email";
import { getConfig } from "./getConfig";
import { ServerApiContext } from "./serverApiUtil";
import { registerCronjob } from "./util/cronUtil";

export function addCardsDueCronjob() {
  registerCronjob({
    name: "cardsDueNotification",
    schedule: "0 0 4 * *", // Daily, 4am server time
    fn: async () => {
      await sendCardsDueNotifications();
    }
  });
}

async function sendCardsDueNotifications() {
  const db = getPrisma();

  const users = await db.user.findMany({
    where: {
      emailVerified: true
    },
  });
  
  for (const user of users) {
    await maybeSendCardsDueEmail(user);
  }
}

function canReceiveCardsDueEmails(user: User) {
  return user.emailVerified && getUserOptions(user).enableCardsDueEmails;
}

async function maybeSendCardsDueEmail(user: User) {
  if (!canReceiveCardsDueEmails(user))
    return;

  const now = new Date();
  const ctx: ServerApiContext = {
    req: null, res: null,
    db: getPrisma(),
    currentUser: user
  };
  const {cards,feedItems} = await getItemsDue(user, ctx, now);
  
  if (cards.length==0 && feedItems.length==0) {
    // No cards due, no feed items, so don't email
    return;
  }
  if (user.lastRemindedAt) {
    // TODO: Enforce minimum time between emails
  }
  
  //TODO: This is actually a dashboard link; there should be a URL that starts the review immediately
  const reviewUrl = `${getConfig().siteUrl}/dashboard`;
  
  // TODO: Add logged-out-accessible unsubscribe link
  await sendEmail({
    user,
    subject: `You have ${cards.length} cards to review and ${feedItems.length} feed items`,
    body: <div>
      <p>{`You have ${cards.length} cards to review and ${feedItems.length} feed items ready to review on Spaced Repetition Reader.`}</p>
      <p><a href={reviewUrl}>Start review</a></p>
    </div>
  });
}
