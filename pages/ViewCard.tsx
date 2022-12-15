import * as React from 'react'
import {useGetApi,doPost} from '../lib/apiUtil';
import {ApiGetCard,ApiDeleteCard} from '../lib/apiTypes';
import {PageWrapper} from '../components/PageWrapper';
import {Loading} from '../components/Loading';
import {redirect} from '../lib/browserUtil';

export function ViewCard({id}: {id: number}) {
  const {data, loading} = useGetApi<ApiGetCard>({
    endpoint: "/api/cards/:cardId",
    query: {cardId: id},
  });
  
  const card = data?.card;
  
  async function deleteCard() {
    if (!card) return;
    if (!confirm(`Are you sure you want to delete this card?`))
      return;
    
    const {result,error} = await doPost<ApiDeleteCard>({
      endpoint: "/api/cards/delete",
      query: {},
      body: {cardId: card.id}
    });
    if (result) {
      redirect("/decks/manage")
    }
  }
  return <PageWrapper>
    {loading && <Loading/>}
  
    {card && <div>
      <div>Front: {card.front}</div>
      <div>Back: {card.back}</div>
    </div>}
    <button onClick={deleteCard}>Delete</button>
  </PageWrapper>
}
