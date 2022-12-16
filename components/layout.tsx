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
    userNameButton: {
      marginRight: 12,
    },
    logOutButton: {
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
    <div className={classes.siteName}>
      <Link href="/" color={false}>
        {"SRSR . SR ... SR"}
      </Link>
    </div>
    
    {currentUser && <>
      <Link href="/users/profile" className={classes.userNameButton}>{currentUser.name}</Link>
      <Link onClick={logOut} className={classes.logOutButton}>Log Out</Link>
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
    sidebarSection: {
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
      <div className={classes.sidebarSection}>
        <Link href="/dashboard" color={false}>Review</Link>
      </div>
      
      <div className={classes.sidebarSection}>
        <Link href="/decks/manage" color={false}>Decks</Link>
        {loading && <Loading/>}
        <ul>
          {data?.decks && data.decks.map(deck => <li key={""+deck.id}>
            <Link color={false} href={`/decks/edit/${deck.id}`}>{deck.name}</Link>
          </li>)}
        </ul>
      </div>
    </div>
    <div className={classes.sidebarSection}>
      <Link href="/feeds/manage" color={false}>Feeds</Link>
    </div>
  </div>;
}

