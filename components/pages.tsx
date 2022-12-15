import React, {useState} from 'react'
import {PageWrapper} from './layout';
import {CardChallenge} from './CardChallenge';
import {CreateCardForm} from './CreateCardForm';
import {CreateDeckForm} from './CreateDeckForm';
import {Link,TextAreaInput,TextInput,ErrorMessage,Loading} from './widgets';
import {RSSCard} from './RSSCard';
import {useGetApi,doPost} from '../lib/apiUtil';
import {useCurrentUser} from '../lib/useCurrentUser';
import {redirect} from '../lib/browserUtil';
import map from 'lodash/map';


export function AboutPage() {
  return <div className="aboutPage">
    <h1>About SRSRSR</h1>
    <p>SRSRSR is spaced repetition software with RSS integration</p>
  </div>
}

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

export function EditDeck({id}: {id: DbKey}) {
  const {loading: loadingDeck, data: deckResult} = useGetApi<ApiTypes.ApiGetDeck>({
    skip: !id,
    endpoint: `/api/decks/:id`,
    query: {id}
  });
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
    if (result) {
      redirect("/decks/manage")
    }
  }
  
  return <PageWrapper>
    {loadingDeck && <Loading/>}
    
    {deck && <>
      <h1>{deck.name}</h1>
      
      {cards && <ul>
        {cards.map(card => <li key={card.id}>
          <a href={`/card/${card.id}`}>{card.front}</a>
        </li>)}
      </ul>}
      
      <CreateCardForm deck={deck}/>
      <button onClick={deleteDeck}>Delete</button>
    </>}
  </PageWrapper>
}

export function Error404Page() {
  return <h1>Page Not Found</h1>
}

export function LandingPage() {
  return <div>
    <h1>SRSR . SR ... SR</h1>
    <p>Space repetition with an integrated RSS reader</p>
  </div>
}

export function LoginPage() {
  const [loginUsername,setLoginUsername] = useState("");
  const [loginPassword,setLoginPassword] = useState("");
  const [createAccountUsername,setCreateAccountUsername] = useState("");
  const [createAccountEmail,setCreateAccountEmail] = useState("");
  const [createAccountPassword,setCreateAccountPassword] = useState("");
  const [confirmPassword,setConfirmPassword] = useState("");
  const [error,setError] = useState<string|null>(null);
  
  async function logIn() {
    const {result,error} = await doPost<ApiTypes.ApiLogin>({
      endpoint: "/api/users/login",
      query: {},
      body: {
        username: loginUsername,
        password: loginPassword
      }
    });
    if (error) {
      setError(error);
    } else {
      redirect("/");
    }
  }
  async function createAccount() {
    if (createAccountPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    
    const {result,error} = await doPost<ApiTypes.ApiSignup>({
      endpoint: "/api/users/signup",
      query: {},
      body: {
        username: createAccountUsername,
        email: createAccountEmail,
        password: createAccountPassword
      }
    });
    if (error) {
      setError(error);
    } else {
      redirect("/");
    }
  }
  
  return <div>
    <form onSubmit={(ev) => {ev.preventDefault(); logIn()}}>
      <div>Log in:</div>
      <TextInput label="Username" value={loginUsername} setValue={setLoginUsername}/>
      <TextInput label="Password" inputType="password" value={loginPassword} setValue={setLoginPassword}/>
      <input type="submit" value="Log In"/>
    </form>
    <form onSubmit={(ev) => {ev.preventDefault(); createAccount()}}>
      <TextInput label="SignUp" value={createAccountUsername} setValue={setCreateAccountUsername}/>
      <TextInput label="Email" value={createAccountEmail} setValue={setCreateAccountEmail}/>
      <TextInput label="Password" inputType="password" value={createAccountPassword} setValue={setCreateAccountPassword}/>
      <TextInput label="Confirm Password" inputType="password" value={confirmPassword} setValue={setConfirmPassword}/>
      <input type="submit" value="Create Account"/>
      
      {error && <div><ErrorMessage message={error}/></div>}
    </form>
  </div>;
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
        {feed.url}
      </li>)}
    </ul>
  </PageWrapper>
}

export function ViewCard({id}: {id: DbKey}) {
  const {data, loading} = useGetApi<ApiTypes.ApiGetCard>({
    endpoint: "/api/cards/:cardId",
    query: {cardId: id},
  });
  
  const card = data?.card;
  
  async function deleteCard() {
    if (!card) return;
    if (!confirm(`Are you sure you want to delete this card?`))
      return;
    
    const {result,error} = await doPost<ApiTypes.ApiDeleteCard>({
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
