import React,{useState} from 'react'
import type {FeedEntry} from '../lib/apiTypes';

export function RSSCard({card, onFinish}: {
  card: FeedEntry,
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