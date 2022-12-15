import React from 'react'
import {useGetApi} from '../lib/apiUtil';
import {Loading} from './Loading';
import type {ApiListDecks} from '../lib/apiTypes';

export function LeftSidebar() {
  const {loading, data} = useGetApi<ApiListDecks>({
    endpoint: "/api/decks/list",
    query: {}
  });
  
  return <div className="leftSidebar">
    <div className="decksList">
      <a href="/decks/manage">Decks</a>
      {loading && <Loading/>}
      
      <ul>
        {data?.decks && data.decks.map(deck => <li>
          <a href={`/decks/edit/${deck.id}`}>{deck.name}</a>
        </li>)}
      </ul>
    </div>
  </div>;
}
