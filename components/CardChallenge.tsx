import React,{useState} from 'react'

export function CardChallenge({card, onFinish}: {
  card: {
    front: string,
    back: string
  },
  onFinish: ()=>void,
}) {
  const [flipped,setFlipped] = useState(false);
  
  function clickFlip() {
    setFlipped(true);
  }
  
  function clickResolution(resolution: "Easy"|"Hard"|"Repeat") {
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