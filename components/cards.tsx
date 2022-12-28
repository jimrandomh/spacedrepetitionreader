import React,{useState} from 'react'
import {doPost} from '../lib/apiUtil';
import {useJssStyles} from '../lib/useJssStyles';
import {Button,FeedItem} from './widgets';
import classNames from 'classnames';
import shuffle from 'lodash/shuffle';
import take from 'lodash/take';

export function CardChallenge({card, onFinish}: {
  card: {
    id: DbKey
    front: string,
    back: string
  },
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
      doPost<ApiTypes.ApiRecordCardImpression>({
        endpoint: "/api/cards/impression",
        query: {},
        body: {
          resolution,
          timeSpent: timeSpentMS,
          cardId: card.id,
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

export function ReviewWrapper({cards, feedItems}: {
  cards: ApiTypes.ApiObjCard[]
  feedItems: ApiTypes.ApiObjRssItem[]
}) {
  const [started,setStarted] = useState(false);
  const [shuffledDeck,setShuffledDeck] = useState<CardOrFeedItem[]|null>(null);
  
  function begin() {
    const limit3feedItems = take(feedItems, 2);
    const allItems: CardOrFeedItem[] = [
      ...cards.map((card): CardOrFeedItem => ({type:"card", card})),
      ...limit3feedItems.map((feedItem): CardOrFeedItem => ({type:"feedItem", feedItem})),
    ];
    const shuffled = shuffle(allItems);
    console.log(shuffled);
    setShuffledDeck(shuffled);
    setStarted(true);
  }
  
  if (!cards.length && !feedItems.length) {
    return <div>You&apos;re all caught up!</div>
  }
  
  if (started && shuffledDeck) {
    return <ReviewInProgress items={shuffledDeck}/>
  } else {
    return <div>
      <div>You have {cards.length} cards and {feedItems.length} RSS feed items ready.</div>
      <Button label="Begin" onClick={begin}/>
    </div>
  }
}

function ReviewInProgress({items}: {
  items: Array<CardOrFeedItem>
}) {
  const [cardPos,setCardPos] = useState(0);
  const currentCard = items[cardPos];
  
  return <>
    {currentCard && currentCard.type==="card" && <CardChallenge
      key={cardPos}
      card={currentCard.card}
      onFinish={() => {
        setCardPos(cardPos+1)
      }}
    />}
    {currentCard && currentCard.type==="feedItem" && <RSSCard
      key={cardPos}
      card={currentCard.feedItem}
      onFinish={() => {
        setCardPos(cardPos+1)
      }}
    />}
    {!currentCard && <div>
      You&apos;re all caught up!
    </div>}
  </>
  return <div/>
}