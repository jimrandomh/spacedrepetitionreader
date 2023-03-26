import React from 'react'
import {useCurrentUser} from '../lib/useCurrentUser';
import {Link, Loading} from './widgets';
import {useGetApi,doPost} from '../lib/apiUtil';
import {redirect} from '../lib/browserUtil';
import {useJssStyles} from '../lib/useJssStyles';
import {UserContextProvider} from '../lib/useCurrentUser';
import {ModalContextProvider} from '../lib/useModal';
import type {Endpoint} from '../lib/routes';
import {Error404Page} from '../components/pages';

export function App({route, routeProps}: {
  route: Endpoint|null
  routeProps: object
}) {
  if (!route) {
    return <Error404Page/>
  }
  
  const CurrentRouteComponent = route.component;
  return <div className="root">
    <UserContextProvider>
    <ModalContextProvider>
      <CurrentRouteComponent {...routeProps}/>
    </ModalContextProvider>
    </UserContextProvider>
  </div>
}

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
        Spaced Repetition Reader
      </Link>
    </div>
    
    {currentUser && <>
      <Link href="/profile" className={classes.userNameButton}>{currentUser.name}</Link>
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
      
      "& ul": {
        paddingLeft: 16,
        marginBlockStart: 8,
      },
      "& li": {
      }
    },
    spacer: {
      height: 16,
    },
    sidebarSection: {
    },
    sectionHeader: {
      display: "block",
      marginTop: 16,
      marginBottom: 6,
    },
    sectionBody: {
      marginLeft: 16,
    },
  }));
  
  const {loading: loadingDecks, data: decksResponse} = useGetApi<ApiTypes.ApiListDecks>({
    endpoint: "/api/decks/list",
    query: {}
  });
  
  const {loading: loadingFeeds, data: subscriptionsResponse} = useGetApi<ApiTypes.ApiListSubscriptions>({
    endpoint: "/api/feeds/subscribed",
    query: {}
  });
  
  return <div className={classes.root}>
    <div className={classes.sidebarSection}>
      <Link href="/dashboard" color={false}>Review</Link>
    </div>
    
    <div className={classes.spacer}/>
    
    <div className={classes.sidebarSection}>
      <Link href="/decks/manage" color={false} className={classes.sectionHeader}>Decks</Link>
      <div className={classes.sectionBody}>
        {loadingDecks && <Loading/>}
        {decksResponse?.decks && decksResponse.decks.map(deck => <div key={""+deck.id}>
          <Link color={false} href={`/decks/edit/${deck.id}`}>{deck.name}</Link>
        </div>)}
        <Link color={true} href="/decks/manage">New Deck</Link>
      </div>
    </div>
    <div className={classes.sidebarSection}>
      <Link href="/feeds/manage" color={false} className={classes.sectionHeader}>Feeds</Link>
      <div className={classes.sectionBody}>
        {loadingFeeds && <Loading/>}
        {subscriptionsResponse?.feeds && subscriptionsResponse.feeds.map(feed => <FeedsListItem key={feed.id} feed={feed}/>)}
        <Link color={true} href="/feeds/add">Add Feed</Link>
      </div>
    </div>
  </div>;
}

function FeedsListItem({feed}: {
  feed: ApiTypes.ApiObjFeedWithUnreadCount
}) {
  const classes = useJssStyles("FeedListItem", () => ({
    root: {
      display: "flex",
    },
    link: {
      flexGrow: 1,
    },
    unreadCount: {
    },
  }));
  
  return <div className={classes.root}>
    <Link color={false} href={`/feeds/${feed.id}`} className={classes.link}>
      {feed.title || feed.url}
    </Link>
    <div className={classes.unreadCount}>{feed.unreadCount}</div>
  </div>
}

export const components = {App,PageWrapper,TopBar,LeftSidebar,FeedsListItem};
