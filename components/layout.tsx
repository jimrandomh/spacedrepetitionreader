import React from 'react'
import {useCurrentUser} from '../lib/useCurrentUser';
import {Link, Loading} from './widgets';
import {useGetApi,doPost} from '../lib/apiUtil';
import {redirect} from '../lib/browserUtil';

export function PageWrapper({children}: {
  children: React.ReactNode
}) {
  return <div className="frontPage">
    <TopBar/>
    <LeftSidebar/>
    <div className="mainPane">
      {children}
    </div>
  </div>
}

export function TopBar() {
  const currentUser = useCurrentUser();
  
  async function logOut() {
    await doPost<ApiTypes.ApiLogout>({
      endpoint: "/api/users/logout",
      query: {}, body: {}
    });
    redirect("/");
  }
  
  return <div className="topBar">
    <Link href="/" className="siteNameHeader">
      {"SRSR . SR ... SR"}
    </Link>
    
    {currentUser && <>
      <Link href="/users/profile" className="userNameButton">{currentUser.name}</Link>
      <Link onClick={logOut} className="logOutButton">Log Out</Link>
    </>}
    {!currentUser && <>
      <Link href="/login" className="logInButton">Log In</Link>
    </>}
  </div>;
}

export function LeftSidebar() {
  const {loading, data} = useGetApi<ApiTypes.ApiListDecks>({
    endpoint: "/api/decks/list",
    query: {}
  });
  
  return <div className="leftSidebar">
    <div className="decksList">
      <Link href="/decks/manage">Decks</Link>
      {loading && <Loading/>}
      
      <ul>
        {data?.decks && data.decks.map(deck => <li key={""+deck.id}>
          <a href={`/decks/edit/${deck.id}`}>{deck.name}</a>
        </li>)}
      </ul>
    </div>
    <div className="feedsList">
      <Link href="/feeds/manage">Feeds</Link>
    </div>
  </div>;
}
