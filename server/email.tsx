import { User } from '@prisma/client';
import juice from 'juice';
import React from 'react';
import { getPrisma } from './db';
import { getApiProviderFromUser, repeatRenderingUntilSettled } from './render';
import { getEmailStylesheet } from './staticStylesheet';
import { convert } from 'html-to-text';
import { getConfig } from './util/getConfig';
import Mailgun from 'mailgun.js';
import formData from 'form-data';
import type { IMailgunClient } from 'mailgun.js/Interfaces';
import { EmailWrapper } from '../components/emails';
import { apiFilterCurrentUser } from './api/auth';

export async function sendEmail({subject, body, user, allowUnverified=false}: {
  subject: string,
  body: React.ReactElement,
  user: User,
  allowUnverified?: boolean,
}) {
  const db = getPrisma();
  const config = getConfig();
  const to = user.email;
  
  if (!allowUnverified && !user.emailVerified) {
    console.log(`Not sending to ${user.name} (${user.email}) because their email is not verified`);
    return;
  }

  const {apiProvider} = getApiProviderFromUser(user, db);
  const filteredUser = apiFilterCurrentUser(user)!;
  const wrappedBody = <EmailWrapper apiProvider={apiProvider} user={filteredUser}>{body}</EmailWrapper>
  const renderedBody = await repeatRenderingUntilSettled("email", wrappedBody, apiProvider);
  const stylesheet = getEmailStylesheet().css;
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

    try {
      const mailgun = getMailgun();
      const {account:_, domain} = parseEmailAddress(from);
      await mailgun.messages.create(domain, {
        to, from,
        subject,
        text: bodyText,
        html: bodyHtml,
      });
    } catch(e) {
      console.error("Sending via mailgun failed: "+e);
      throw e;
    }
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

function parseEmailAddress(addr: string): {realname: string|null, account: string, domain: string} {
  if (addr.includes("<")) {
    // Format is: Name <foo@bar.com>
    const match = addr.match(/([^<]*)<(\S+)@(\S+\.\S+)>/);
    if (!match) {
      throw new Error("Invalid email address: "+JSON.stringify(addr));
    }
    const [_,realname,account,domain] = match;
    return {
      realname: realname.trim(),
      account: account,
      domain: domain,
    };
  } else {
    // Format is: foo@bar.com
    const re = /\S+@\S+\.\S+/;
    if (!re.test(addr)) {
      throw new Error("Invalid email address: "+JSON.stringify(addr));
    }
    const parts = addr.split("@");
    return {
      realname: null,
      account: parts[0],
      domain: parts[1]
    };
  }
}
