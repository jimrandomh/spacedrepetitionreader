import React from 'react'
import { useJssStyles } from '../../lib/useJssStyles';
import { defineRoute, Endpoint } from '../../lib/util/routeUtil';
import {LoggedOutAccessiblePage} from '../layout';


const AboutPage = defineRoute({
  name: "AboutPage",
  path: "/about",
  access: "LoggedOut",
}, () => {
  return <LoggedOutAccessiblePage title="About">
    <h1>About Spaced Repetition Reader</h1>
    <PitchText/>
  </LoggedOutAccessiblePage>
});

const PrivacyPolicyPage = defineRoute({
  name: "PrivacyPolicyPage",
  path: "/privacy-policy",
  access: "LoggedOut",
}, () => {
  return <LoggedOutAccessiblePage title="Privacy Policy">
    <h1>Spaced Repetition Reader: Privacy Policy</h1>

    <p>{"Spaced Repetition Reader is a personal side project. It isn't monetized (other than perhaps donations), and there are no plans to monetize it. If this ever changes, the change will be accompanied by an email to all users and at least 30 days notice."}</p>
    <p>{"We will not look at, disclose, or sell your cards, decks, or subscriptions, except as requested by you or as required by law. You retain copyright to any cards, decks, and other content you create through the site."}</p>
    <p>{"We may look at aggregate statistics, such as numbers of cards created and viewed, top-subscribed feeds, and so on, in ways that don't identify you individually. We may use third-party tools to gather these statistics, such as Google Analytics. Card content is not shared with Google."}</p>
    <p>We use Google Analytics to measure site usage.</p>
  </LoggedOutAccessiblePage>
});

export function PitchText() {
  const classes = useJssStyles("PitchText", () => ({
    pitchText: {
      maxWidth: 600,
      margin: "0 auto",
    },
  }));
  return <div className={classes.pitchText}>
    <p>Spaced Repetition Reader makes reviewing flashcards motivating by mixing
    webcomics (or anything with an RSS feed) into your decks. It uses a
    repetition schedule optimized for maximizing your retention of
    information.</p>
    
    <p>Spaced Repetition Reader is open source (AGPL-v3.0), so you can run your
    own server if you wish to do so. Check it out <a href="https://www.github.com/jimrandomh/spacedrepetitionreader">on GitHub</a>.</p>
  </div>
}

export const routes: Endpoint[] = [AboutPage,PrivacyPolicyPage];
export const components = {PitchText};
