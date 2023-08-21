import { User } from '@prisma/client';
import juice from 'juice';
import React from 'react';
import { getPrisma } from './db';
import { getApiProviderFromUser, repeatRenderingUntilSettled } from './server';
import { getStaticStylesheet } from './staticStylesheet';
import { convert } from 'html-to-text';
import { getConfig } from './getConfig';
import Mailgun from 'mailgun.js';
import formData from 'form-data';
import { IMailgunClient } from 'mailgun.js/Interfaces';

export async function sendEmail({to, subject, body, user}: {
  to: string,
  subject: string,
  body: React.ReactElement,
  user: User|null
}) {
  const db = getPrisma();
  const config = getConfig();

  const {apiProvider} = getApiProviderFromUser(user, db);
  const renderedBody = await repeatRenderingUntilSettled(body, apiProvider);
  const stylesheet = getStaticStylesheet().css;
  const bodyWithStyles = applyInlineStylesTo(stylesheet, renderedBody);
  const textVersion = convert(renderedBody, {
    wordwrap: 80,
  });
  const subjectWithPrefix = config.emailSubjectPrefix + subject;
  
  await handleRenderedEmail({
    to,
    from: config.emailFromAddress,
    subject: subjectWithPrefix,
    bodyText: textVersion,
    bodyHtml: bodyWithStyles,
  });
}

async function handleRenderedEmail({to, from, subject, bodyText, bodyHtml}: {
  to: string
  from: string
  subject: string
  bodyText: string
  bodyHtml: string
}) {
  const config = getConfig();

  if (config.enableEmail && config.mailgunApiKey) {
    console.log(`To: ${to}\nFrom: ${from}\nSubject: ${subject}\n${bodyText}`);
    console.log(`Sending via Mailgun`);

    const mailgun = getMailgun();
    const {account:_, domain} = parseEmailAddress(from);
    await mailgun.messages.create(domain, {
      to, from,
      subject,
      text: bodyText,
      html: bodyHtml,
    });
  } else {
    console.log(`To: ${to}\nFrom: ${from}\nSubject: ${subject}\n${bodyText}`);
  }
}

function applyInlineStylesTo(stylesheet: string, html: string): string {
  return juice(`<style>${stylesheet}</style>${html}`);
}

let mailgun: IMailgunClient|null = null;
function getMailgun(): IMailgunClient {
  const config = getConfig();
  if (mailgun) {
    return mailgun;
  }
  if (!config.mailgunApiKey) {
    throw new Error("Mailgun is not configured");
  }
  mailgun = new Mailgun(formData).client({
    username: "api",
    key: config.mailgunApiKey,
  });
  return mailgun;
}

function parseEmailAddress(addr: string): {account: string, domain: string} {
  const re = /\S+@\S+\.\S+/;
  if (!re.test(addr)) {
    throw new Error("Invalid email address");
  }
  const parts = addr.split("@");
  return {
    account: parts[0],
    domain: parts[1]
  };
}
