import React from 'react';
import { getConfig } from "../server/util/getConfig";

export function CardsDueEmail({numCards, numFeedItems}: {
  numCards: number,
  numFeedItems: number,
}) {
  //TODO: This is actually a dashboard link; there should be a URL that starts the review immediately
  const reviewUrl = `${getConfig().siteUrl}/dashboard`;
  return <div>
    <p>{`You have ${numCards} cards to review and ${numFeedItems} feed items ready to review on Spaced Repetition Reader.`}</p>
    <p><a href={reviewUrl}>Start review</a></p>
  </div>
}

export function ConfirmYourAddressEmail({confirmLink}: {
  confirmLink: string
}) {
  return <div>
    <p>Click this link to confirm your email address:</p>
    <p><a href={confirmLink}>Confirm</a></p>
  </div>
}

export function PasswordResetEmail({resetPasswordLink}: {
  resetPasswordLink: string
}) {
  return <div>
    <p>Click this link to reset your password:</p>
    <p><a href={resetPasswordLink}>Reset password</a></p>
  </div>
}

export const components = {CardsDueEmail, ConfirmYourAddressEmail, PasswordResetEmail};
