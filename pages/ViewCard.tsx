import * as React from 'react'
import {useGetApi} from '../lib/apiUtil';
import {ApiGetCard} from '../lib/apiTypes';

export function ViewCard({id}: {id: string}) {
  const {data:card, loading} = useGetApi<ApiGetCard>({
    endpoint: "/api/cards/:cardId",
    query: {cardId: id},
  });
  
  if (loading) {
    return <div>Loading</div>
  } else {
    return <div>
      Front: {card?.front}
      Back: {card?.back}
    </div>
  }
}
