import React from 'react';
import { PrismaClient, User } from "@prisma/client";
import { getUserOptions } from "../lib/userOptions";
import { getItemsDue } from "./api/decks";
import { getPrisma } from "./db";
import { sendEmail } from "./email";
import { getConfig } from "./util/getConfig";
import { ServerApiContext } from "./serverApiUtil";
import { registerCronjob } from "./util/cronUtil";
import { timezoneNameToUtcOffset } from '../lib/util/timeUtil';

export function addCardsDueCronjob() {
  registerCronjob({
    name: "cardsDueNotification",
    schedule: "0 */30 * * * *", // Twice hourly, at :00 and :30
    fn: async ({db, intendedAt}) => {
      await sendCardsDueNotifications({db, when: intendedAt});
    }
  });
}

async function sendCardsDueNotifications({db,  when}: {
  db: PrismaClient,
  when: Date
}) {
  const users = await db.user.findMany({
    where: {
      emailVerified: true
    },
  });
  
  const nowUtcHours = when.getUTCHours() + (when.getUTCMinutes()/60.0)

  for (const user of users) {
    if (userCardsDueTimeSettingMatches(user, nowUtcHours)) {
      await maybeSendCardsDueEmail(user);
    }
  }
}

function userCardsDueTimeSettingMatches(user: User, nowUtcHours: number): boolean {
  const userConfig = getUserOptions(user);
  const {timezone, cardsBecomeDueAt} = userConfig;
  const userTimezoneUtcOffset = timezoneNameToUtcOffset(timezone);

  let cardsDueAt_inGmt = cardsBecomeDueAt - userTimezoneUtcOffset;
  while (cardsDueAt_inGmt >= 24) cardsDueAt_inGmt -= 24;
  while (cardsDueAt_inGmt < 0) cardsDueAt_inGmt += 24;
  
  return (cardsDueAt_inGmt === nowUtcHours);
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
