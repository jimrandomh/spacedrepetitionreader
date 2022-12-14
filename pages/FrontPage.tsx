import React, {useState} from 'react'
import {TopBar} from '../components/TopBar';
import {LeftSidebar} from '../components/LeftSidebar';
import {CardChallenge} from '../components/CardChallenge';
import {Loading} from '../components/Loading';
import {useGetApi} from '../lib/apiUtil';
import {ApiCardsDue} from '../lib/apiTypes';

export function FrontPage() {
  const {data:cardsDue, loading} = useGetApi<ApiCardsDue>({
    endpoint: "/api/cards/due",
    query: {}, body: {},
  });
  const [cardPos,setCardPos] = useState(0);
  
  return <div className="frontPage">
    <TopBar/>
    <LeftSidebar/>
    
    <div className="mainPane">
      {loading && <Loading/>}
      {!loading && cardsDue && cardPos>=cardsDue.cards.length &&  <div>
        You're all caught up!
      </div>}
      {!loading && cardsDue && cardPos<cardsDue.cards.length &&
        <CardChallenge
          key={cardPos}
          card={{
            front: cardsDue.cards[cardPos].front,
            back: cardsDue.cards[cardPos].back,
          }}
          onFinish={() => {
            setCardPos(cardPos+1)
          }}
        />
      }
    </div>
  </div>
}
