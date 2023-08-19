import React,{useState} from 'react'
import DatePicker from "react-datepicker";
import {LoggedOutAccessiblePage, PageWrapper} from './layout';
import {LoginForm,CreateCardForm,CreateDeckForm,SubscribeToFeedForm} from './forms';
import {ErrorMessage,Link,Loading,BulletSeparator,FeedScrollList,Redirect} from './widgets';
import {ReviewWrapper} from './cards';
import {useGetApi,doPost} from '../lib/apiUtil';
import {useCurrentUser} from '../lib/useCurrentUser';
import {redirect} from '../lib/browserUtil';
import {useJssStyles} from '../lib/useJssStyles';
import { useLocation } from '../lib/useLocation';


export function AboutPage() {
  return <LoggedOutAccessiblePage>
    <h1>About Spaced Repetition Reader</h1>
    <p>Spaced Repetition Reader is spaced repetition software with RSS integration</p>
  </LoggedOutAccessiblePage>
}

export function PrivacyPolicyPage() {
  return <LoggedOutAccessiblePage>
    <h1>Spaced Repetition Reader: Privacy Policy</h1>
    <p>TODO: Write this</p>
  </LoggedOutAccessiblePage>
}


export function DashboardPage() {
  const currentUser = useCurrentUser();
  // const [overrideDate, setOverrideDate] = useState<Date|null>(null);
  const { query } = useLocation();
  const overrideDate = query.get('overrideDate') ? new Date(query.get('overrideDate')!) : null;
  
  const {data, loading} = useGetApi<ApiTypes.ApiCardsDue>({
    skip: !currentUser,
    endpoint: "/api/cards/due",
    searchParams:  overrideDate ? new URLSearchParams({
      date: overrideDate?.toISOString(),
    }) : undefined,
    query: {},
  });
  
  if (!currentUser) {
    redirect('/login');
    return <div/>;
  }
  
  return <PageWrapper>
    {loading && <Loading/>}
    Simulated date:{' '}
    <DatePicker selected={overrideDate} showTimeSelect onChange={(date) => {
      if(!date) {
        window.location.assign('/dashboard');
      } else {
        window.location.assign(`/dashboard?overrideDate=${date.toISOString()}`);
      }
    }} />
    {data && <ReviewWrapper
      cards={data.cards}
      feedItems={data.feedItems}
      simulatedDate={overrideDate ?? undefined}
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
      color: "#006",
      textAlign: "center",
      marginTop: 64,
      marginBottom: 48,
    },
    pitchText: {
      maxWidth: 600,
      margin: "0 auto",
    },
    loginForm: {
      margin: "0 auto",
    },
  }));
  const currentUser = useCurrentUser();
  if(currentUser) {
    return <Redirect to="/dashboard"/>
  }
  
  return <div>
    <h1 className={classes.title}>Spaced Repetition Reader</h1>
    <div className={classes.pitchText}>
      <p>Spaced Repetition Reader makes reviewing flashcards motivating by mixing
      webcomics (or anything with an RSS feed) into your decks. It uses a
      repetition schedule optimized for maximizing your retention of information
      and will support sharing decks, integration with Roam and other note-taking
      tools, and import from Anki.</p>
      
      <p>Spaced Repetition Reader is open source (AGPL-v3.0), so you can run your
      own server if you wish to do so. Check it out <a href="https://www.github.com/jimrandomh/spacedrepetitionreader">on GitHub</a>.</p>
    </div>
    
    <div className={classes.loginForm}>
      <LoginForm/>
    </div>
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

export function AddFeedPage() {
  return <PageWrapper>
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
      {data?.feedItems && <FeedScrollList items={data.feedItems}/>}
    </div>
    
  </PageWrapper>
}

export function UserProfilePage() {
  return <PageWrapper>
    <h1>Settings</h1>
    
    <div>{"There aren't any configuration settings yet."}</div>
  </PageWrapper>
}


export const components = {AboutPage,PrivacyPolicyPage,DashboardPage,EditDeck,Error404Page,LandingPage,LoginPage,ManageDecks,ManageFeeds,ViewCardPage,ViewFeedPage,UserProfilePage};
