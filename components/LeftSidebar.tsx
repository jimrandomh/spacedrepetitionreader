import React from 'react'
import {useGetApi} from '../lib/apiUtil';
import {Link,Loading} from './widgets';

export function LeftSidebar() {
  const {loading, data} = useGetApi<ApiTypes.ApiListDecks>({
    endpoint: "/api/decks/list",
    query: {}
  });
  
  return <div className="leftSidebar">
    <div className="decksList">
      <Link href="/decks/manage">Decks</Link>
      {loading && <Loading/>}
      
      <ul>
        {data?.decks && data.decks.map(deck => <li key={""+deck.id}>
          <a href={`/decks/edit/${deck.id}`}>{deck.name}</a>
        </li>)}
      </ul>
    </div>
    <div className="feedsList">
      <Link href="/feeds/manage">Feeds</Link>
    </div>
  </div>;
}
