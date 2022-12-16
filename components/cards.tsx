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
    onClick={ev => onClick()}
    className={classNames(classes.button,className)}
  >
    {label}
  </div>
}

export function RSSCard({card, onFinish}: {
  card: ApiTypes.FeedEntry,
  onFinish: ()=>void,
}) {
  const classes = useJssStyles("RSSCad", () => ({
    next: {},
    rssTitle: {},
    rssBody: {},
  }));
  
  const [flipped,setFlipped] = useState(false);
  
  function clickNext() {
    onFinish();
  }
  
  return <CardFrame
    contents={<>
      <div className={classes.rssTitle}>{card.title}</div>
      <div className={classes.rssBody}>
        <div dangerouslySetInnerHTML={{__html: card.summary}}/>
      </div>
    </>}
    buttons={<>
      <CardButton className={classes.next} onClick={() => clickNext()} label="Next"/>
    </>}
  />
}
