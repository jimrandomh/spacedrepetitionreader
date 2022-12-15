import React from 'react'
import {useCurrentUser} from '../lib/useCurrentUser';
import {Link, Loading} from './widgets';
import {useGetApi,doPost} from '../lib/apiUtil';
import {redirect} from '../lib/browserUtil';
import {useJssStyles} from '../lib/useJssStyles';


export function PageWrapper({children}: {
  children: React.ReactNode
}) {
  const classes = useJssStyles("PageWrapper", () => ({
    root: {
      position: "absolute",
      top: 48, bottom: 0,
      left: 200, right: 0,
      overflowY: "scroll",
      padding: 16,
    },
  }));
  
  return <div>
    <TopBar/>
    <LeftSidebar/>
    <div className={classes.root}>
      {children}
    </div>
  </div>
}

export function TopBar() {
  const classes = useJssStyles("TopBar", () => ({
    root: {
      position: "absolute",
      background: "#88f",
      display: "flex",
      padding: 12,
      boxSizing: "border-box",
      
      top: 0, height: 48,
      left: 0, right: 0,
    },
    siteName: {
      flexGrow: 1,
    },
  }));
  
  const currentUser = useCurrentUser();
  
  async function logOut() {
    await doPost<ApiTypes.ApiLogout>({
      endpoint: "/api/users/logout",
      query: {}, body: {}
    });
    redirect("/");
  }
  
  return <div className={classes.root}>
    <Link href="/" className={classes.siteName}>
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
  const classes = useJssStyles("LeftSidebar", () => ({
    root: {
      position: "absolute",
      top: 48, bottom: 0,
      left: 0, width: 200,
      boxSizing: "border-box",
      
      background: "#eef",
      padding: 16,
    },
    decksList: {
      "& ul": {
        paddingLeft: 16,
        marginBlockStart: 8,
      },
      "& li": {
      }
    },
  }));
  
  const {loading, data} = useGetApi<ApiTypes.ApiListDecks>({
    endpoint: "/api/decks/list",
    query: {}
  });
  
  return <div className={classes.root}>
    <div className={classes.decksList}>
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
