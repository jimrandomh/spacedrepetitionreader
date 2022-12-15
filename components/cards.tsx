import React,{useState} from 'react'
import {doPost} from '../lib/apiUtil';
import {useJssStyles} from '../lib/useJssStyles';
import classNames from 'classnames';

export function CardChallenge({card, onFinish}: {
  card: {
    id: number
    front: string,
    back: string
  },
  onFinish: ()=>void,
}) {
  const classes = useJssStyles("CardChallenge", () => ({
    root: {
      margin: "0 auto",
      border: "1px solid #ddd",
      padding: 32,
      maxWidth: 600,
    },
    
    content: {
      textAlign: "center",
    },
    
    buttons: {
      marginTop: 64,
      display: "flex",
      justifyContent: "center",
    },
    
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
  }));
  
  const [flipped,setFlipped] = useState(false);
  const [startTime,setStartTime] = useState<Date>(() => new Date());
  const [flipTime,setFlipTime] = useState<Date|null>(null);
  
  function clickFlip() {
    setFlipTime(new Date());
    setFlipped(true);
  }
  
  function clickResolution(resolution: "Easy"|"Hard"|"Repeat") {
    const timeSpentMS = flipTime!.getTime() - startTime.getTime();
    
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
    return <div className={classes.root}>
      <div className={classes.content}>{card.back}</div>
      
      <div className={classes.buttons}>
        <div className={classes.easy} onClick={ev => clickResolution("Easy")}>Easy</div>
        <div className={classes.hard} onClick={ev => clickResolution("Hard")}>Hard</div>
        <div className={classes.again} onClick={ev => clickResolution("Repeat")}>Repeat</div>
      </div>
    </div>
  } else {
    return <div className={classes.root}>
      <div className={classes.content}>{card.front}</div>
      
      <div className={classes.buttons}>
        <div className={classes.flip} onClick={ev => clickFlip()}>Flip</div>
      </div>
    </div>
  }
}

export function RSSCard({card, onFinish}: {
  card: ApiTypes.FeedEntry,
  onFinish: ()=>void,
}) {
  const [flipped,setFlipped] = useState(false);
  
  function clickNext() {
    onFinish();
  }
  
  return <div className="cardChallenge">
    <div className="content">
      <div className="rssTitle">{card.title}</div>
      <div className="rssBody">
        <div dangerouslySetInnerHTML={{__html: card.summary}}/>
      </div>
    </div>
    
    <div className="buttons">
      <div className="button next" onClick={ev => clickNext()}>Next</div>
    </div>
  </div>
}
