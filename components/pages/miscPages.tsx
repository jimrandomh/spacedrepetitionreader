import React, { useState } from 'react'
import { PageWrapper } from '../layout';
import { LoginForm, CreateCardForm, CreateDeckForm, SubscribeToFeedForm, DeckSettingsForm, ImportDeckForm, FeedPreview, AdminStatisticsPanel } from '../forms';
import {ErrorMessage,Link,Loading,BulletSeparator,FeedScrollList,Redirect} from '../widgets';
import {ReviewWrapper} from '../cards';
import {useGetApi,doPost} from '../../lib/apiUtil';
import {useCurrentUser} from '../../lib/useCurrentUser';
import {redirect} from '../../lib/util/browserUtil';
import {useJssStyles} from '../../lib/useJssStyles';
import { useDebugOptions } from '../debug';
import { SubscriptionSettingsForm, UserConfiguration } from '../settings';
import { PageTitle } from '../../lib/renderContext';
import { simpleTruncateStr } from '../../lib/util/truncationUtil';
import { ModalDialog, useModal } from '../../lib/useModal';
import { useLocation } from '../../lib/useLocation';
import { PitchText } from '../pages/metaPages';


export function DashboardPage() {
  const debugOptions = useDebugOptions();
  const {query} = useLocation();
  
  const {data, loading} = useGetApi<ApiTypes.ApiCardsDue>({
    endpoint: "/api/cards/due",
    searchParams:  debugOptions.overrideDate ? new URLSearchParams({
      date: debugOptions.overrideDate?.toISOString(),
    }) : undefined,
    query: {},
  });
  
  // If the URI contains ?flipCard=[cardId] then this was a link from a review-reminder
  // email; that email showed one card, and the user clicked the Flip button, which took
  // them here. So we should guarantee that card is in the review (if eligible), is
  // first, and loads pre-flipped.
  const flipCardId = query?.get("flipCard");
  
  return <PageWrapper title="Dashboard">
    {loading && <Loading/>}
    {data && <ReviewWrapper
      cards={data.cards}
      flipCardId={flipCardId??undefined}
      subscriptions={data.subscriptions}
      feedItems={data.feedItems}
      simulatedDate={debugOptions.overrideDate ?? undefined}
    />}
  </PageWrapper>
}

export function EditDeck({id}: {id: DbKey}) {
  const classes = useJssStyles("EditDeck", () => ({
    moreOptions: {
    },
    cardsListSection: {
    },
    cardsList: {
      paddingInlineStart: 30,
    },
    cardsListHeading: {
    },
    cardsListItem: {
      marginBottom: 8,
    },
    createCardFormWrapper: {
      paddingLeft: 20,
    },
  }));
  
  const {loading: loadingDeck, data: deckResult} = useGetApi<ApiTypes.ApiGetDeck>({
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
  
  return <PageWrapper title={deck?.name ?? null}>
    {loadingDeck && <Loading/>}
    
    {deck && <>
      <h1>{deck.name}</h1>
      
      <div className={classes.moreOptions}>
        <Link onClick={notImplementedMessage} color={false}>Share</Link>
        <BulletSeparator/>
        <Link onClick={deleteDeck} color={false}>Delete</Link>
      </div>
      
      
      {deck && <DeckSettingsForm deck={deck}/>}

      {cards && cards.length>0 && <div className={classes.cardsListSection}>
        <h3 className={classes.cardsListHeading}>
          {cards.length>0 && <>Cards ({cards.length})</>}
          {cards.length===0 && <>Cards</>}
        </h3>
        {!cards.length && <div>
          This deck doesn&apos;t have any cards yet.
        </div>}
        {cards.length && <ul className={classes.cardsList}>
          {cards.map(card => <li key={card.id} className={classes.cardsListItem}>
            <Link href={`/card/${card.id}`} color={false}>{card.front}</Link>
          </li>)}
        </ul>}
      </div>}
      
      <h3>New Card</h3>
      <div className={classes.createCardFormWrapper}>
        <CreateCardForm deck={deck}/>
      </div>
    </>}
    {error && <ErrorMessage message={error}/>}
  </PageWrapper>
}

export function LandingPage() {
  const classes = useJssStyles("LandingPage", () => ({
    title: {
      color: "#006",
      textAlign: "center",
      marginTop: 64,
      marginBottom: 48,
    },
    developmentWarning: {
      textAlign: "center",
      background: "#fcc",
      padding: 8,
      maxWidth: 510,
      margin: "0 auto",
      border: "1px solid #f00",
      borderRadius: 6,
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
    <PitchText/>
    
    <div className={classes.loginForm}>
      <div className={classes.developmentWarning}>
        This site is still under development. It might lose your data.
      </div>
      <LoginForm/>
    </div>
  </div>
}

export function ManageDecks() {
  const {loading: loadingDecks, data: decksResult} = useGetApi<ApiTypes.ApiListDecks>({
    endpoint: "/api/decks/list",
    query: {}
  });
  
  return <PageWrapper title="Decks">
    <h1>Manage Decks</h1>
    
    {loadingDecks && <Loading/>}
    <ul>
      {decksResult?.decks && decksResult.decks.map(deck => <li key={deck.id}>
        <a href={`/decks/edit/${deck.id}`}>{deck.name}</a>
      </li>)}
    </ul>
    
    <h2>Create Deck</h2>
    <CreateDeckForm/>
    
    <h2>Import Deck</h2>
    <ImportDeckForm/>
  </PageWrapper>
}

export function ManageFeeds() {
  const classes = useJssStyles("ManageFeeds", () => ({
    subscribeSection: {
      marginBottom: 50,
    },
    suggestedSection: {
      marginBottom: 50,
    },
  }));

  const {loading: loadingSubscriptions, data} = useGetApi<ApiTypes.ApiListSubscriptions>({
    endpoint: "/api/feeds/subscribed",
    query: {}
  });
  
  const {loading: loadingSuggestions, data: suggestedFeeds} = useGetApi<ApiTypes.ApiGetSuggestedSubscriptions>({
    endpoint: "/api/feeds/suggested",
    query: {}
  });

  const {openModal} = useModal();
  const [suggestionError,setSuggestionError] = useState<string|null>(null);

  function previewFeed(feed: ApiTypes.ApiObjFeed) {
    if (feed.url==="") return;
    
    openModal({
      fn: (onClose) => {
        return <ModalDialog>
          <FeedPreview
            feedUrl={feed.url}
            onError={err => setSuggestionError(err)}
            onClose={onClose}
          />
        </ModalDialog>
      }
    })
  }
  
  
  return <PageWrapper title="Feeds" layout="centered">
    <div className={classes.subscribeSection}>
      <h2>Subscribe to Websites</h2>
      <SubscribeToFeedForm/>
    </div>
    
    {(suggestedFeeds?.feeds && suggestedFeeds.feeds.length > 0) && <div className={classes.suggestedSection}>
      <h2>Suggested</h2>
      {loadingSuggestions && <Loading/>}
      
      <ul>
        {suggestedFeeds.feeds.map(feed => <li key={feed.id}>
          <Link onClick={()=>previewFeed(feed)}>
            {feed.title || feed.url}
          </Link>
        </li>)}
      </ul>
      {suggestionError && <ErrorMessage message={suggestionError}/>}
    </div>}
    
    {(data?.feeds?.length??0) > 0 && <>
      <h2>Your Subscriptions</h2>
      {loadingSubscriptions && <Loading/>}
      <ul>
        {data?.feeds && data.feeds.map(feed => <li key={feed.id}>
          <Link href={`/feeds/${feed.id}`}>
            {feed.title || feed.url}
          </Link>
        </li>)}
      </ul>
    </>}
  </PageWrapper>
}

export function ViewCardPage({id}: {id: DbKey}) {
  const {data, loading} = useGetApi<ApiTypes.ApiGetCard>({
    endpoint: "/api/cards/:cardId",
    query: {cardId: id},
  });
  const [error,setError] = useState<string|null>(null);
  
  const card = data?.card;
  const truncatedCardFront = card?.front ? simpleTruncateStr(card.front, 30) : undefined;
  
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
  return <PageWrapper title={truncatedCardFront ?? null}>
    {truncatedCardFront && <PageTitle title={truncatedCardFront}/>}
    {loading && <Loading/>}
  
    {card && <div>
      <div>Front: {card.front}</div>
      <div>Back: {card.back}</div>
    </div>}
    <button onClick={deleteCard}>Delete</button>
    {error && <ErrorMessage message={error}/>}
  </PageWrapper>
}

export function ViewFeedPage({id}: {id: DbKey}) {
  const classes = useJssStyles("ViewFeedPage", () => ({
    buttons: {},
    settings: {
      marginTop: 32,
    },
    feed: {
      marginTop: 32,
    },
    blocked: {
      marginTop: 32,
    },
    caughtUp: {
      textAlign: "center",
    },
  }));
  const {data, loading} = useGetApi<ApiTypes.ApiLoadFeed>({
    endpoint: "/api/feed/load/:feedId",
    query: {feedId: id}
  });
  const {data: cardsDue, loading: _loadingCardsDue} = useGetApi<ApiTypes.ApiCardsDue>({
    endpoint: "/api/cards/due",
    query: {},
  });
  const [error,setError] = useState<string|null>(null);
  
  async function forceRefresh() {
    const {result:_, error} = await doPost<ApiTypes.ApiRefreshFeed>({
      endpoint: "/api/feed/refresh",
      query: {}, body: {feedId: id}
    });
    if (error !== null) {
      setError(error);
    } else {
      redirect(`/feeds/${id}`);
    }
  }
  
  async function markAllAsRead() {
    await doPost<ApiTypes.ApiMarkAllAsRead>({
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
  
  const hasUnreviewedCards = cardsDue && cardsDue.cards.length > 0;
  const isBlocked = (data?.subscription?.config.blockDirectAccess && hasUnreviewedCards) ?? false;
  
  return <PageWrapper title={data?.feed?.title ?? null}>
    {loading && <Loading/>}
    
    <div className={classes.buttons}>
      <Link color={false} onClick={markAllAsRead}>Mark All As Read</Link>
      <BulletSeparator/>
      <Link color={false} onClick={forceRefresh}>Refresh</Link>
      <BulletSeparator/>
      <Link color={false} onClick={unsubscribe}>Unsubscribe</Link>
      {error && <ErrorMessage message={error}/>}
    </div>
    
    {data?.subscription && <div className={classes.settings}>
      <SubscriptionSettingsForm
        subscription={data.subscription}
        disabled={isBlocked}
      />
    </div>}
    
    {isBlocked && <div className={classes.blocked}>
      Finish your cards first to access this feed.
    </div>}
    {!isBlocked && <div className={classes.feed}>
      {data?.feedItems && data.feedItems.length===0 && <div className={classes.caughtUp}>
        You&apos;re all caught up
      </div>}
      {data?.feedItems && <FeedScrollList items={data.feedItems}/>}
    </div>}
    
  </PageWrapper>
}

export function UserProfilePage() {
  return <PageWrapper title="Profile">
    <h1>Settings</h1>
    
    <UserConfiguration/>
  </PageWrapper>
}

export function AdminDashboardPage() {
  return <PageWrapper title="Admin Dashboard">
    <h1>Admin Dashboard</h1>
    
    <h2>Core Statistics</h2>
    <AdminStatisticsPanel/>
  </PageWrapper>
}


export const components = {DashboardPage,EditDeck,LandingPage,PitchText,ManageDecks,ManageFeeds,ViewCardPage,ViewFeedPage,UserProfilePage,AdminDashboardPage};
