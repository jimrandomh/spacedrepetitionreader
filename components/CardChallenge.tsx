import React,{useState} from 'react'
import {doPost} from '../lib/apiUtil';

export function CardChallenge({card, onFinish}: {
  card: {
    id: number
    front: string,
    back: string
  },
  onFinish: ()=>void,
}) {
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
    return <div className="cardChallenge">
      <div className="content">{card.back}</div>
      
      <div className="buttons">
        <div className="button easy" onClick={ev => clickResolution("Easy")}>Easy</div>
        <div className="button hard" onClick={ev => clickResolution("Hard")}>Hard</div>
        <div className="button again" onClick={ev => clickResolution("Repeat")}>Repeat</div>
      </div>
    </div>
  } else {
    return <div className="cardChallenge">
      <div className="content">{card.front}</div>
      
      <div className="buttons">
        <div className="button flip" onClick={ev => clickFlip()}>Flip</div>
      </div>
    </div>
  }
}