import React, { useMemo, useState } from 'react'
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


function CardChallenge({card, preFlipped,onFinish, simulatedDate}: {
  card: {
    id: DbKey
    front: string,
    back: string
  },
  preFlipped?: boolean,
  simulatedDate?: Date,
  onFinish: ()=>void,
}) {
  const _classes = useJssStyles("CardChallenge", () => ({
  }));
  
  const [flipped,setFlipped] = useState(!!preFlipped);
  const [startTime] = useState<Date>(() => new Date());
  const [flipTime,setFlipTime] = useState<Date|null>(preFlipped ? new Date() : null);
  
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
        <CardButton type="easy" onClick={() => clickResolution("Easy")} label="Easy"/>
        <CardButton type="hard" onClick={() => clickResolution("Hard")} label="Hard"/>
        <CardButton type="again" onClick={() => clickResolution("Repeat")} label="Repeat"/>
      </>}
    />
  } else {
    return <CardFrame
      contents={<>
        {card.front}
      </>}
      buttons={<>
        <CardButton type="flip" onClick={() => clickFlip()} label="Flip"/>
      </>}
    />
  }
}

export function CardFrame({contents, buttons}: {
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

export function CardButton({label, onClick, href, className, type}: {
  label: string,
  onClick?: ()=>void,
  href?: string,
  className?: string,
  type: "flip"|"easy"|"hard"|"again"|"next"
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
    next: {},
  }));
  
  if (href) {
    return <a
      href={href}
      className={classNames(classes.button,className)}
    >
      {label}
    </a>
  } else {
    return <div
      onClick={onClick}
      className={classNames(classes.button, className, classes[type])}
    >
      {label}
    </div>
  }
}

function RSSCard({card, onFinish}: {
  card: ApiTypes.ApiObjRssItem,
  onFinish: ()=>void,
}) {
  const classes = useJssStyles("RSSCard", () => ({
    root: {
    },
    contents: {
      textAlign: "left",
    },
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
      <CardButton type="next" onClick={() => clickNext()} label="Next"/>
    </>}
  />
}

type CardOrFeedItem = {type:"card",card:ApiTypes.ApiObjCard}|{type:"feedItem",feedItem:ApiTypes.ApiObjRssItem};

export function ReviewWrapper({cards, flipCardId, subscriptions, feedItems, simulatedDate}: {
  cards: ApiTypes.ApiObjCard[]
  flipCardId?: string,
  subscriptions: ApiTypes.ApiObjSubscription[]
  feedItems: ApiTypes.ApiObjRssItem[]
  simulatedDate?: Date
}) {
  //const [shuffledDeck,setShuffledDeck] = useState<CardOrFeedItem[]|null>(null);
  
  const allItems = useMemo(
    () => prepareReviewOrder({ cards, flipCardId, feedItems, subscriptions }),
    [cards, flipCardId, feedItems, subscriptions]
  );
  const shuffledDeck = allItems;
  const flipFirst = shuffledDeck?.[0]?.type==="card" && shuffledDeck[0].card.id===flipCardId;
  const [started,setStarted] = useState(flipFirst);

  function begin() {
    setStarted(true);
  }
  
  if (!cards.length && !feedItems.length) {
    return <div>You&apos;re all caught up!</div>
  }
  

  if (started && shuffledDeck) {
    return <ReviewInProgress items={shuffledDeck} flipFirst={flipFirst} simulatedDate={simulatedDate}/>
  } else {
    return <div>
      <div>You have {cards.length} cards and {feedItems.length} RSS feed items ready.</div>
      <Button label="Begin" onClick={begin}/>
    </div>
  }
}

function ReviewInProgress({items, flipFirst, simulatedDate}: {
  items: Array<CardOrFeedItem>
  flipFirst?: boolean,
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
      preFlipped={cardPos===0 && flipFirst}
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

function prepareReviewOrder({cards, flipCardId, feedItems, subscriptions}: {
  cards: ApiTypes.ApiObjCard[]
  flipCardId?: string,
  subscriptions: ApiTypes.ApiObjSubscription[]
  feedItems: ApiTypes.ApiObjRssItem[]
}): CardOrFeedItem[] {
  const maxFeedItems = 3; //TODO: Make this a user setting
  const selectedFeedItems = selectFeedItemsFromAllSubscriptions(maxFeedItems, feedItems, subscriptions);
  
  const taggedCards: CardOrFeedItem[] = shuffle(cards)
    .map(card => ({type: "card", card}));
  const taggedFeedItems: CardOrFeedItem[] = selectedFeedItems
    .map(feedItem => ({type: "feedItem", feedItem}));
  let result = randomInterleaveMany([taggedCards, taggedFeedItems]);
  
  // If flipCardId is provided and is present in the review, move it to the front
  if (flipCardId) {
    const flipCard = result.find(item => item.type==="card" && item.card.id===flipCardId);
    if (flipCard) {
      result = [flipCard, ...result.filter(item => item.type!=="card" || item.card.id!==flipCardId)];
    }
  }
  
  // If there are more feed items that weren't selected, add them at the end
  const selectedFeedItemIds = new Set<string>(selectedFeedItems.map(item => item.id));
  const unselectedFeedItems: CardOrFeedItem[] = feedItems
    .filter(feedItem => !selectedFeedItemIds.has(feedItem.id))
    .map(feedItem => ({type: "feedItem", feedItem}));
  if (unselectedFeedItems.length > 0) {
    result = [...result, ...unselectedFeedItems];
  }
  
  return result;
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
