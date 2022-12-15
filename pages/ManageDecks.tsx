import React from 'react'
import {PageWrapper} from '../components/PageWrapper';
import {Loading} from '../components/Loading';
import {useGetApi} from '../lib/apiUtil';
import {CreateDeckForm} from '../components/CreateDeckForm';

export function ManageDecks() {
  const {loading: loadingDecks, data: decksResult} = useGetApi<ApiTypes.ApiListDecks>({
    endpoint: "/api/decks/list",
    query: {}
  });
  
  return <PageWrapper>
    <h1>Manage Decks</h1>
    
    {loadingDecks && <Loading/>}
    <ul>
      {decksResult?.decks && decksResult.decks.map(deck => <li key={deck.id}>
        <a href={`/decks/edit/${deck.id}`}>{deck.name}</a>
      </li>)}
    </ul>
    
    <h2>Create Deck</h2>
    <CreateDeckForm/>
  </PageWrapper>
}