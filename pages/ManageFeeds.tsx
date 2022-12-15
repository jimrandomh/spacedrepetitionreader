import React from 'react'
import {PageWrapper} from '../components/PageWrapper';
import {Loading} from '../components/Loading';
import {useGetApi} from '../lib/apiUtil';

export function ManageFeeds() {
  const {loading: loadingSubscriptions, data} = useGetApi<ApiTypes.ApiListSubscriptions>({
    endpoint: "/api/feeds/subscribed",
    query: {}
  });
  
  return <PageWrapper>
    <h1>Manage Feeds</h1>
    
    {loadingSubscriptions && <Loading/>}
    <ul>
      {data?.feeds && data.feeds.map(feed => <li key={feed.id}>
        {feed.url}
      </li>)}
    </ul>
  </PageWrapper>
}