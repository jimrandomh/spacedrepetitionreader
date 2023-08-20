import { User } from '@prisma/client';
import juice from 'juice';
import React from 'react';
import { getPrisma } from './db';
import { getApiProviderFromUser, repeatRenderingUntilSettled } from './server';
import { getStaticStylesheet } from './staticStylesheet';
import { convert } from 'html-to-text';

export async function sendEmail({to, subject, body, user}: {
  to: string,
  subject: string,
  body: React.ReactElement,
  user: User|null
}) {
  const db = getPrisma();
  const {apiProvider} = getApiProviderFromUser(user, db);
  const renderedBody = await repeatRenderingUntilSettled(body, apiProvider);
  const stylesheet = getStaticStylesheet().css;
  const bodyWithStyles = applyInlineStylesTo(stylesheet, renderedBody);
  const textVersion = convert(renderedBody, {
    wordwrap: 80,
  });
  
  // TODO: Actually send it
  console.log(`To: ${to}\nSubject: ${subject}\n${textVersion}`);
}

function applyInlineStylesTo(stylesheet: string, html: string): string {
  return juice(`<style>${stylesheet}</style>${html}`);
}
