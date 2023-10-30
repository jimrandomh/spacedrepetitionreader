import React from 'react';
import { PrismaClient, User } from "@prisma/client";
import { getUserOptions } from "../lib/userOptions";
import { getItemsDue } from "./api/decks";
import { getPrisma } from "./db";
import { sendEmail } from "./email";
import { ServerApiContext } from "./serverApiUtil";
import { registerCronjob } from "./util/cronUtil";
import { timezoneNameToUtcOffset } from '../lib/util/timeUtil';
import { CardsDueEmail } from '../components/emails';
import { createEmailLoginToken } from './api/auth';

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
      await maybeSendCardsDueEmail({user});
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

export async function maybeSendCardsDueEmail({user, force}: {
  user: User
  force?: boolean
}) {
  if (!force && !canReceiveCardsDueEmails(user)) {
    return;
  }

  const now = new Date();
  const ctx: ServerApiContext = {
    req: null, res: null,
    db: getPrisma(),
    currentUser: user
  };
  const {cards,feedItems} = await getItemsDue({
    currentUser: user,
    ctx,
    now
  });
  
  if (cards.length==0 && feedItems.length==0) {
    if (force) {
      console.log(`Not sending cards-due email to ${user.name} because nothing is due`);
    }
    // No cards due, no feed items, so don't email
    return;
  }
  if (!force) {
    if (user.lastEmailOpenedAt && user.lastRemindedAt) {
      const timeSinceOpened = now.getTime() - user.lastEmailOpenedAt.getTime();
      const timeSinceReminded = now.getTime() - user.lastRemindedAt.getTime();
      const oneHourInMs = 3600*1000;
      const oneDayInMs = 24 * 3600 * 1000;
      const oneDayInMsMinusEpsilon = oneDayInMs - oneHourInMs;
      const oneWeekInMs = 7 * oneDayInMs;
      if (timeSinceReminded < oneDayInMsMinusEpsilon) {
        // skip; too soon
        return;
      } else if(timeSinceOpened > oneWeekInMs && timeSinceReminded > oneWeekInMs){
        // continue; inactive users get one per week
      } else if (timeSinceOpened < oneDayInMs) {
        // continue; active users get a daily email on schedule
      } else {
        // skip; inactive users don't get emails on days 2-6
        return;
      }
    } else {
      // First time sending a message. Pretend that this was opened immediately
      // so that we can distinguish the second email case.
      await ctx.db.user.update({
        where: { id: user.id },
        data: { lastEmailOpenedAt: now },
      });
    }
  }
  
  const emailLoginToken = await createEmailLoginToken(user, ctx.db);
  
  // TODO: Add logged-out-accessible unsubscribe link
  await sendEmail({
    user,
    subject: `You have ${cards.length} cards to review and ${feedItems.length} feed items`,
    body: <CardsDueEmail
      numCards={cards.length}
      numFeedItems={feedItems.length}
      emailLoginToken={emailLoginToken}
    />
  });
}
