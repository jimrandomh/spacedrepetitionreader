import React, {useState} from 'react'
import {PageWrapper} from '../components/PageWrapper';
import {CardChallenge} from '../components/CardChallenge';
import {RSSCard} from '../components/RSSCard';
import {Loading} from '../components/Loading';
import {useGetApi} from '../lib/apiUtil';
import {useCurrentUser} from '../lib/useCurrentUser';
import {redirect} from '../lib/browserUtil';
import map from 'lodash/map';

export function DashboardPage() {
  const currentUser = useCurrentUser();
  
  const {data:cardsDue, loading} = useGetApi<ApiTypes.ApiCardsDue>({
    skip: !currentUser,
    endpoint: "/api/cards/due",
    query: {},
  });
  const {data:xkcdFeed, loading: loadingXkcd} = useGetApi<ApiTypes.ApiLoadFeed>({
    skip: !currentUser,
    endpoint: "/api/feed/load/:feedUrl",
    query: {feedUrl: "https://xkcd.com/atom.xml"},
  });
  
  const [cardPos,setCardPos] = useState(0);
  
  if (!currentUser) {
    redirect('/login');
    return <div/>;
  }
  
  const combinedCards = [
    ...(map(cardsDue?.cards, card=>({type:"card", ...card}))),
    ...(map(xkcdFeed?.feedItems, rssEntry=>({type:"rss", ...rssEntry}))),
  ];
  const currentCard = (combinedCards && cardPos<combinedCards.length) ? combinedCards[cardPos] : undefined;
  
  return <PageWrapper>
    {loading && <Loading/>}
    {!loading && cardPos>=combinedCards.length && <div>
      You're all caught up!
    </div>}
    {currentCard && currentCard.type==="card" && <CardChallenge
      key={cardPos}
      card={currentCard}
      onFinish={() => {
        setCardPos(cardPos+1)
      }}
    />}
    {currentCard && currentCard.type==="rss" && <RSSCard
      key={cardPos}
      card={currentCard}
      onFinish={() => {
        setCardPos(cardPos+1)
      }}
    />}
  </PageWrapper>
}
