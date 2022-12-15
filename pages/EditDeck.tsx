import React from 'react'
import {PageWrapper} from '../components/PageWrapper';
import {Loading} from '../components/Loading';
import {useGetApi,doPost} from '../lib/apiUtil';
import {CreateDeckForm} from '../components/CreateDeckForm';
import {redirect} from '../lib/browserUtil';
import type {ApiGetDeck,ApiDeleteDeck} from '../lib/apiTypes';

export function EditDeck({id}: {id: number}) {
  const {loading: loadingDeck, data: deckResult} = useGetApi<ApiGetDeck>({
    skip: !id,
    endpoint: `/api/decks/:id`,
    query: {id}
  });
  const deck = deckResult?.deck;
  
  async function deleteDeck() {
    if (!deck) return;
    if (!confirm(`Are you sure you want to delete the deck "${deck.name}"?`))
      return;
    
    const {result,error} = await doPost<ApiDeleteDeck>({
      endpoint: "/api/decks/delete",
      query: {},
      body: {id}
    });
    if (result) {
      redirect("/decks/manage")
    }
  }
  
  return <PageWrapper>
    {deck && <h1>{deck.name}</h1>}
    
    {loadingDeck && <Loading/>}
    
    <button onClick={deleteDeck}>Delete</button>
  </PageWrapper>
}
