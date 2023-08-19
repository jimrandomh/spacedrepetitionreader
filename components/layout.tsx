import React from 'react'
import {useCurrentUser} from '../lib/useCurrentUser';
import {Link, Loading} from './widgets';
import {useGetApi,doPost} from '../lib/apiUtil';
import {redirect} from '../lib/browserUtil';
import {useJssStyles} from '../lib/useJssStyles';
import {UserContextProvider} from '../lib/useCurrentUser';
import {LocationContextProvider} from '../lib/useLocation';
import {ModalContextProvider} from '../lib/useModal';
import type {Endpoint} from '../lib/routes';
import {Error404Page} from '../components/pages';


export function App({route, routeProps, url}: {
  route: Endpoint|null
  routeProps: object
  url: string 
}) {
  if (!route) {
    return <Error404Page/>
  }

  const CurrentRouteComponent = route.component;
  return <div className="root">
    <LocationContextProvider value={url}>
    <UserContextProvider>
    <ModalContextProvider>
      <CurrentRouteComponent {...routeProps}/>
    </ModalContextProvider>
    </UserContextProvider>
    </LocationContextProvider>
  </div>
}

export function PageWrapper({children}: {
  children: React.ReactNode
}) {
  const classes = useJssStyles("PageWrapper", () => ({
    mainColumn: {
      position: "absolute",
      top: 48, bottom: 0,
      left: 200, right: 0,
      overflowY: "scroll",
    },
    body: {
      minHeight: "calc(100% - 40px)",
      padding: 16,
    },
    footer: {
      height: 40,
      width: "100%",
      textAlign: "right",
      paddingRight: 16,
    },
  }));
  
  return <div>
    <TopBar/>
    <LeftSidebar/>
    <div className={classes.mainColumn}>
      <div className={classes.body}>
        {children}
      </div>
      <div className={classes.footer}>
        <Link href="/about">About</Link>
        {" · "}
        <Link href="/privacy-policy">Privacy Policy</Link>
      </div>
    </div>
  </div>
}

export function LoggedOutAccessiblePage({children}: {
  children: React.ReactNode,
}) {
  const currentUser = useCurrentUser();
  
  // Show the side and top bars iff logged in
  if (currentUser) {
    return <PageWrapper>
      {children}
    </PageWrapper>
  } else {
    return <div>
      {children}
    </div>
  }
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
          <DeckListItem deck={deck}/>
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

export function DeckListItem({deck}: {
  deck: ApiTypes.ApiObjDeckWithDueCount
}) {
  return <SidebarListItemWithCount
    title={deck.name}
    href={`/decks/edit/${deck.id}`}
    unreadCount={deck.due}
  />
}

export function FeedsListItem({feed}: {
  feed: ApiTypes.ApiObjFeedWithUnreadCount
}) {
  return <SidebarListItemWithCount
    title={feed.title || feed.url}
    href={`/feeds/${feed.id}`}
    unreadCount={feed.unreadCount}
  />
}

export function SidebarListItemWithCount({title, href, unreadCount}: {
  title: string
  href: string
  unreadCount: number
}) {
  const classes = useJssStyles("SidebarListItemWithCount", () => ({
    root: {
      marginBottom: 8,
    },
    link: {
      display: "flex",
    },
    title: {
      flexGrow: 1,
    },
    unreadCount: {
    },
  }));
  
  return <div className={classes.root}>
    <Link
      href={href}
      color={false} className={classes.link}
    >
      <div className={classes.title}>
        {title}
      </div>
      <div className={classes.unreadCount}>
        {unreadCount}
      </div>
    </Link>
  </div>
}

export const components = {App,PageWrapper,LoggedOutAccessiblePage,TopBar,LeftSidebar,DeckListItem,FeedsListItem,SidebarListItemWithCount};
