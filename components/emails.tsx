import React from 'react';
import { useGetApi } from '../lib/apiUtil';
import { getConfig } from "../server/util/getConfig";
import { CardButton, CardFrame } from './cards';
import { Loading } from './widgets';

export function CardsDueEmail({numCards, numFeedItems}: {
  numCards: number,
  numFeedItems: number,
}) {
  const {loading, data} = useGetApi<ApiTypes.ApiOneDueCard>({
    endpoint: "/api/cards/oneDueCard",
    query: {}
  });

  //TODO: This is actually a dashboard link; there should be a URL that starts the review immediately
  const reviewUrl = `${getConfig().siteUrl}/dashboard`;

  if (loading || !data) {
    return <Loading/>;
  }

  return <div>
    <p>{`You have ${numCards} cards to review and ${numFeedItems} feed items ready to review on Spaced Repetition Reader.`}</p>
    <p><a href={reviewUrl}>Start review</a></p>
    
    <CardFrame
      contents={<>{data.card.front}</>}
      buttons={<>
        <CardButton type="flip" label="Flip" href={reviewUrl}/>
      </>}
    />
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
