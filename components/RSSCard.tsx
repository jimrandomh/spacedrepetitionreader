import React,{useState} from 'react'

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