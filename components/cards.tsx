import React, { useState } from 'react'
import { doPost } from '../lib/apiUtil';
import { useJssStyles } from '../lib/useJssStyles';
import { Button, FeedItem } from './widgets';
import classNames from 'classnames';
import shuffle from 'lodash/shuffle';
import take from 'lodash/take';
import groupBy from 'lodash/groupBy';
import mapValues from 'lodash/mapValues';
import keyBy from 'lodash/keyBy';
import orderBy from 'lodash/orderBy';
import reverse from 'lodash/reverse';
import { randomInterleaveMany } from '../lib/util/rngUtil';


export function CardChallenge({card, onFinish, simulatedDate}: {
  card: {
    id: DbKey
    front: string,
    back: string
  },
  simulatedDate?: Date,
  onFinish: ()=>void,
}) {
  const classes = useJssStyles("CardChallenge", () => ({
    flip: {
      background: "#ccf"
    },
    easy: {
      background: "#cfc",
    },
    hard: {
      background: "#ffc",
    },
    again: {
      background: "#fcc",
    },
  }));
  
  const [flipped,setFlipped] = useState(false);
  const [startTime] = useState<Date>(() => new Date());
  const [flipTime,setFlipTime] = useState<Date|null>(null);
  
  function clickFlip() {
    setFlipTime(new Date());
    setFlipped(true);
  }
  
  function clickResolution(resolution: "Easy"|"Hard"|"Repeat") {
    if (!flipTime) throw new Error("Inconsistent state");
    const timeSpentMS = flipTime.getTime() - startTime.getTime();
    
    void (async function() {
      await doPost<ApiTypes.ApiRecordCardImpression>({
        endpoint: "/api/cards/impression",
        query: {},
        body: {
          resolution,
          timeSpent: timeSpentMS,
          cardId: card.id,
          date: simulatedDate?.toISOString(),
        },
      });
    })();
    
    onFinish();
  }
  
  if (flipped) {
    return <CardFrame
      contents={<>
        {card.back}
      </>}
      buttons={<>
        <CardButton className={classes.easy} onClick={() => clickResolution("Easy")} label="Easy"/>
        <CardButton className={classes.hard} onClick={() => clickResolution("Hard")} label="Hard"/>
        <CardButton className={classes.again} onClick={() => clickResolution("Repeat")} label="Repeat"/>
      </>}
    />
  } else {
    return <CardFrame
      contents={<>
        {card.front}
      </>}
      buttons={<>
        <CardButton className={classes.flip} onClick={() => clickFlip()} label="Flip"/>
      </>}
    />
  }
}

function CardFrame({contents, buttons}: {
  contents: React.ReactNode
  buttons: React.ReactNode
}) {
  const classes = useJssStyles("CardFrame", () => ({
    root: {
      margin: "0 auto",
      border: "1px solid #ddd",
      padding: 32,
      maxWidth: 600,
    },
    contents: {
      textAlign: "center",
    },
    buttons: {
      marginTop: 64,
      display: "flex",
      justifyContent: "center",
    },
    
  }));
  
  return <div className={classes.root}>
    <div className={classes.contents}>
      {contents}
    </div>
    
    <div className={classes.buttons}>
      {buttons}
    </div>
  </div>
}

function CardButton({label, onClick, className}: {
  label: string,
  onClick: ()=>void,
  className?: string,
}) {
  const classes = useJssStyles("CardButton", () => ({
    button: {
      display: "inline-block",
      cursor: "pointer",
      padding: 16,
      minWidth: 100,
      margin: 8,
      border: "1px solid #666",
      borderRadius: 16,
      textAlign: "center",
    },
  }));
  
  return <div
    onClick={() => onClick()}
    className={classNames(classes.button,className)}
  >
    {label}
  </div>
}

export function RSSCard({card, onFinish}: {
  card: ApiTypes.ApiObjRssItem,
  onFinish: ()=>void,
}) {
  const classes = useJssStyles("RSSCard", () => ({
    root: {
    },
    contents: {
      textAlign: "left",
    },
    next: {},
  }));
  
  function clickNext() {
    void (async function() {
      await doPost<ApiTypes.ApiMarkFeedItemRead>({
        endpoint: "/api/feedItems/markAsRead",
        query: {},
        body: {
          itemId: card.id,
        },
      });
    })();
    onFinish();
  }
  
  return <CardFrame
    contents={<div className={classes.contents}>
      <FeedItem item={card}/>
    </div>}
    buttons={<>
      <CardButton className={classes.next} onClick={() => clickNext()} label="Next"/>
    </>}
  />
}

type CardOrFeedItem = {type:"card",card:ApiTypes.ApiObjCard}|{type:"feedItem",feedItem:ApiTypes.ApiObjRssItem};

export function ReviewWrapper({cards, subscriptions, feedItems, simulatedDate}: {
  cards: ApiTypes.ApiObjCard[]
  subscriptions: ApiTypes.ApiObjSubscription[]
  feedItems: ApiTypes.ApiObjRssItem[]
  simulatedDate?: Date
}) {
  const [started,setStarted] = useState(false);
  const [shuffledDeck,setShuffledDeck] = useState<CardOrFeedItem[]|null>(null);
  
  function begin() {
    const maxFeedItems = 3; //TODO: Make this a user setting
    const selectedFeedItems = selectFeedItemsFromAllSubscriptions(maxFeedItems, feedItems, subscriptions);
    
    const taggedCards: CardOrFeedItem[] = shuffle(cards)
      .map(card => ({type: "card", card}));
    const taggedFeedItems: CardOrFeedItem[] = selectedFeedItems
      .map(feedItem => ({type: "feedItem", feedItem}));
    const allItems = randomInterleaveMany([taggedCards, taggedFeedItems]);

    setShuffledDeck(allItems);
    setStarted(true);
  }
  
  if (!cards.length && !feedItems.length) {
    return <div>You&apos;re all caught up!</div>
  }
  
  if (started && shuffledDeck) {
    return <ReviewInProgress items={shuffledDeck} simulatedDate={simulatedDate}/>
  } else {
    return <div>
      <div>You have {cards.length} cards and {feedItems.length} RSS feed items ready.</div>
      <Button label="Begin" onClick={begin}/>
    </div>
  }
}

function ReviewInProgress({items, simulatedDate}: {
  items: Array<CardOrFeedItem>
  simulatedDate?: Date
}) {
  const [cardPos,setCardPos] = useState(0);
  const currentCard = items[cardPos];
  
  function advanceToNextCard() {
    setCardPos(cardPos+1)
  }
  
  return <>
    {currentCard && currentCard.type==="card" && <CardChallenge
      key={cardPos}
      card={currentCard.card}
      onFinish={() => {
        advanceToNextCard();
      }}
      simulatedDate={simulatedDate}
    />}
    {currentCard && currentCard.type==="feedItem" && <RSSCard
      key={cardPos}
      card={currentCard.feedItem}
      onFinish={() => {
        advanceToNextCard();
      }}
    />}
    {!currentCard && <div>
      You&apos;re all caught up!
    </div>}
  </>
}

function selectFeedItemsFromAllSubscriptions(
  maxItemsToSelect: number,
  availableFeedItems: ApiTypes.ApiObjRssItem[],
  subscriptions: ApiTypes.ApiObjSubscription[]
): ApiTypes.ApiObjRssItem[] {
  const subscriptionsByFeedId = keyBy(subscriptions, s=>s.feedId);

  // First decide how many items to take from each feed. We do this by sampling
  // from the set of all available feed-items, then counting up the number of
  // samples that were from each subscription, so this is weighted by the number
  // of unread items.
  const numItemsByFeed = mapValues(groupBy(take(availableFeedItems, maxItemsToSelect), item=>item.feedId), items=>items.length);
  
  // Select items, based on subscription-specific rules (oldest first, newest first, or random).
  const itemsByFeed: {[k: string]: ApiTypes.ApiObjRssItem[]} = Object.fromEntries(
    Object.entries(numItemsByFeed)
      .map(
        ([feedId, numItems]) => ([
          feedId,
          selectFeedItemsFromSingleSubscription(
            numItems,
            subscriptionsByFeedId[feedId],
            availableFeedItems.filter(item=>item.feedId===feedId)
          )
        ])
      )
  )
  
  console.log(itemsByFeed);
  
  // Take a round-robin interleaving of the feeds (preserving order within each feed)
  const roundRobinTurnOrder = shuffle(Object.keys(itemsByFeed));
  const result: ApiTypes.ApiObjRssItem[] = [];

  let i = 0;
  let done = false;
  while (!done) {
    done = true;
    for (const feedId of roundRobinTurnOrder) {
      if (i < itemsByFeed[feedId].length) {
        done = false;
        result.push(itemsByFeed[feedId][i]);
      }
    }
    i++;
  }
  
  return result;
}

function selectFeedItemsFromSingleSubscription(
  numItemsToSelect: number,
  subscription: ApiTypes.ApiObjSubscription,
  availableItems: ApiTypes.ApiObjRssItem[]
): ApiTypes.ApiObjRssItem[] {
  console.log(`Sorting by ${subscription.config.presentationOrder}`);
  switch(subscription.config.presentationOrder) {
    case "oldestFirst":
      return take(
        orderBy(availableItems, item=>item.pubDate),
        numItemsToSelect
      );
    case "newestFirst":
      return take(
        reverse(orderBy(availableItems, item=>item.pubDate)),
        numItemsToSelect
      );
    case "random":
      return take(
        shuffle(availableItems),
        numItemsToSelect
      );
  }
}

export const components = {CardChallenge,CardFrame,CardButton,RSSCard,ReviewWrapper,ReviewInProgress};

