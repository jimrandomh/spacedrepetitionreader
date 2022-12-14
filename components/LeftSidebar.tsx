import * as React from 'react'

export function LeftSidebar() {
  return <div className="leftSidebar">
    <div className="decksList">
      <div className="decksListLabel">Decks</div>
      
      <ul>
        <li>Typescript Trivia</li>
        <li>Rationality Jargon</li>
        <li>AI Alignment Concepts</li>
      </ul>
    </div>
  </div>;
}
