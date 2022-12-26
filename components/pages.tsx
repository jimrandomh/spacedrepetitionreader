import React,{useState} from 'react'
import {PageWrapper} from './layout';
import {LoginForm,CreateCardForm,CreateDeckForm,SubscribeToFeedForm} from './forms';
import {ErrorMessage,Link,Loading,BulletSeparator,FeedItem,Redirect} from './widgets';
import {ReviewWrapper} from './cards';
import {useGetApi,doPost} from '../lib/apiUtil';
import {useCurrentUser} from '../lib/useCurrentUser';
import {redirect} from '../lib/browserUtil';
import {useJssStyles} from '../lib/useJssStyles';


export function AboutPage() {
  return <div className="aboutPage">
    <h1>About Spaced Repetition Reader</h1>
    <p>Spaced Repetition Reader is spaced repetition software with RSS integration</p>
  </div>
}

export function DashboardPage() {
  const currentUser = useCurrentUser();
  
  const {data, loading} = useGetApi<ApiTypes.ApiCardsDue>({
    skip: !currentUser,
    endpoint: "/api/cards/due",
    query: {},
  });
  
  if (!currentUser) {
    redirect('/login');
    return <div/>;
  }
  
  return <PageWrapper>
    {loading && <Loading/>}
    {data && <ReviewWrapper
      cards={data.cards}
      feedItems={data.feedItems}
    />}
  </PageWrapper>
}

export function EditDeck({id}: {id: DbKey}) {
  const classes = useJssStyles("EditDeck", () => ({
    cardsListLabel: {
    },
    moreOptions: {
      marginTop: 128,
    },
  }));
  
  const {loading: loadingDeck, data: deckResult} = useGetApi<ApiTypes.ApiGetDeck>({
    skip: !id,
    endpoint: `/api/decks/:id`,
    query: {id}
  });
  const [error,setError] = useState<string|null>(null);
  const deck = deckResult?.deck;
  const cards = deckResult?.cards;
  
  async function deleteDeck() {
    if (!deck) return;
    if (!confirm(`Are you sure you want to delete the deck "${deck.name}"?`))
      return;
    
    const {result,error} = await doPost<ApiTypes.ApiDeleteDeck>({
      endpoint: "/api/decks/delete",
      query: {},
      body: {id}
    });
    if(error!==null) {
      setError(error);
    } else if (result) {
      redirect("/decks/manage")
    }
  }
  
  function notImplementedMessage() {
    alert("This feature is not yet implemented");
  }
  
  return <PageWrapper>
    {loadingDeck && <Loading/>}
    
    {deck && <>
      <h1>{deck.name}</h1>
      
      {cards && !cards.length && <div>
        This deck doesn&apos;t have any cards yet.
      </div>}
      {cards && cards.length>0 && <div>
        <div className={classes.cardsListLabel}>
          Cards ({cards.length})
        </div>
        <ul>
          {cards.map(card => <li key={card.id}>
            <a href={`/card/${card.id}`}>{card.front}</a>
          </li>)}
        </ul>
      </div>}
      
      <CreateCardForm deck={deck}/>
      
      <div className={classes.moreOptions}>
        <Link onClick={notImplementedMessage} color={false}>Share</Link>
        <BulletSeparator/>
        <Link onClick={deleteDeck} color={false}>Delete</Link>
      </div>
    </>}
    {error && <div><ErrorMessage message={error}/></div>}
  </PageWrapper>
}

export function Error404Page() {
  return <h1>Page Not Found</h1>
}

export function LandingPage() {
  const classes = useJssStyles("LandingPage", () => ({
    title: {
      color: "#006"
    },
  }));
  const currentUser = useCurrentUser();
  if(currentUser) {
    return <Redirect to="/dashboard"/>
  }
  
  return <div>
    <h1 className={classes.title}>Spaced Repetition Reader</h1>
    <p>Spaced repetition with an integrated RSS reader</p>
    
    <LoginForm/>
  </div>
}

export function LoginPage() {
  return <LoginForm/>
}

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
        <Link href={`/feeds/${feed.id}`}>
          {feed.title || feed.url}
        </Link>
      </li>)}
    </ul>
    
    <SubscribeToFeedForm/>
  </PageWrapper>
}

export function ViewCardPage({id}: {id: DbKey}) {
  const {data, loading} = useGetApi<ApiTypes.ApiGetCard>({
    endpoint: "/api/cards/:cardId",
    query: {cardId: id},
  });
  const [error,setError] = useState<string|null>(null);
  
  const card = data?.card;
  
  async function deleteCard() {
    if (!card) return;
    if (!confirm(`Are you sure you want to delete this card?`))
      return;
    
    const {result:_,error} = await doPost<ApiTypes.ApiDeleteCard>({
      endpoint: "/api/cards/delete",
      query: {},
      body: {cardId: card.id}
    });
    if(error !== null) {
      setError(error);
    } else {
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
    {error && <div><ErrorMessage message={error}/></div>}
  </PageWrapper>
}

export function ViewFeedPage({id}: {id: DbKey}) {
  const classes = useJssStyles("ViewFeedPage", () => ({
    buttons: {},
    feed: {
      marginTop: 32,
    },
    caughtUp: {
      textAlign: "center",
    },
  }));
  const {data, loading} = useGetApi<ApiTypes.ApiLoadFeed>({
    endpoint: "/api/feed/load/:id",
    query: {id}
  });
  const [error,setError] = useState<string|null>(null);
  
  async function forceRefresh() {
    const {result:_, error} = await doPost({
      endpoint: "/api/feed/refresh",
      query: {}, body: {id}
    });
    if (error !== null) {
      setError(error);
    } else {
      redirect(`/feeds/${id}`);
    }
  }
  
  async function markAllAsRead() {
    await doPost({
      endpoint: "/api/feed/markAsRead",
      query: {}, body: {feedId: id}
    });
    redirect(`/feeds/${id}`);
  }
  
  async function unsubscribe() {
    const {result:_,error} = await doPost<ApiTypes.ApiUnsubscribeFromFeed >({
      endpoint: "/api/feeds/unsubscribe",
      query: {}, body: {feedId: id}
    });
    if (error !== null) {
      setError(error);
    } else {
      redirect("/dashboard");
    }
  }
  
  return <PageWrapper>
    {loading && <Loading/>}
    
    <div className={classes.buttons}>
      <Link color={false} onClick={markAllAsRead}>Mark All As Read</Link>
      <BulletSeparator/>
      <Link color={false} onClick={forceRefresh}>Refresh</Link>
      <BulletSeparator/>
      <Link color={false} onClick={unsubscribe}>Unsubscribe</Link>
      {error && <div><ErrorMessage message={error}/></div>}
    </div>
    
    <div className={classes.feed}>
      {data?.feedItems && data.feedItems.length===0 && <div className={classes.caughtUp}>
        You&apos;re all caught up
      </div>}
      {data?.feedItems && data.feedItems.map(item =>
        <FeedItem key={item.id} item={item}/>
      )}
    </div>
    
  </PageWrapper>
}
