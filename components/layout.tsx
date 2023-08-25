import React, { useMemo, useState } from 'react'
import {useCurrentUser} from '../lib/useCurrentUser';
import {BulletSeparator, Link, Loading} from './widgets';
import {useGetApi,doPost} from '../lib/apiUtil';
import {redirect} from '../lib/util/browserUtil';
import {useJssStyles} from '../lib/useJssStyles';
import {UserContext} from '../lib/useCurrentUser';
import {LocationContextProvider, ParsedLocation} from '../lib/useLocation';
import {ModalContextProvider, ModalDialog, useModal} from '../lib/useModal';
import {Error404Page, RedirectToLoginPage} from '../components/pages';
import {DebugPanel, useDebugOptions} from './debug';
import classNames from 'classnames';
import {breakpoints} from '../lib/breakpoints';
import { pathToRoute } from '../lib/routes';


export function App({url}: {
  url: string
}) {
  const classes = useJssStyles("App", () => ({
    root: {
      fontFamily: "sans-serif",
    },
  }));

  const {route,routeProps} = pathToRoute(url);
  const location: ParsedLocation = useMemo(() => ({
    url, route, routeProps
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [url, route, JSON.stringify(routeProps)]);

  const {loading: currentUserLoading, data} = useGetApi<ApiTypes.ApiWhoami>({
    endpoint: "/api/users/whoami",
    query: {}
  });

  const currentUser = data?.currentUser ?? null;

  if (!location || !location.route) {
    return <Error404Page/>
  }

  const CurrentRouteComponent = location.route.component;
  if (currentUserLoading) {
    return <Loading/>;
  }
  if (location.route.access === 'LoggedIn' && !currentUser) {
    return <RedirectToLoginPage/>
  }
  
  return <div className={classes.root}>
    <LocationContextProvider value={location}>
    <UserContext.Provider value={currentUser}>
    <ModalContextProvider>
      <CurrentRouteComponent {...location.routeProps}/>
    </ModalContextProvider>
    </UserContext.Provider>
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
      color: "rgba(0,0,0,.8)",
      fontFamily: "sans-serif",
      fontSize: 12,
    },
  }));

  const [sidebarOpen,setSidebarOpen] = useState<boolean|undefined>(undefined);
  const {openModal} = useModal();
  const canDebug = true; //TODO

  const openDebugPanel = () => {
    openModal({
      fn: (onClose) => {
      return <ModalDialog>
        <DebugPanel onClose={onClose}/>
       </ModalDialog>
      }
    });
  }
  
  return <div>
    <TopBar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}/>
    <LeftSidebar open={sidebarOpen} setOpen={setSidebarOpen} />
    <div className={classes.mainColumn}>
      <div className={classes.body}>
        {children}
      </div>
      <div className={classes.footer}>
        {canDebug && <>
          <Link onClick={openDebugPanel} color={false}>Debug</Link>
          <BulletSeparator/>
        </>}
        <Link href="/about" color={false}>About</Link>
        <BulletSeparator/>
        <Link href="/privacy-policy" color={false}>Privacy Policy</Link>
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

export function TopBar({sidebarOpen, setSidebarOpen}: {
  sidebarOpen: boolean|undefined
  setSidebarOpen: (open: boolean)=>void
}) {
  const classes = useJssStyles("TopBar", () => ({
    root: {
      position: "absolute",
      background: "#88f",
      display: "flex",
      
      top: 0, height: 48,
      left: 0, right: 0,
    },
    mainSection: {
      display: "flex",
      flexGrow: 1,
      padding: 12,
    },
    siteName: {
      flexGrow: 1,
      fontSize: 17,
      color: "rgba(0,0,0,.8)",
    },
    simulatedDate: {
      marginRight: 8,
    },
    topBarButtons: {
      fontWeight: 300,
      fontSize: 12,
      marginTop: 8,
      color: "rgba(0,0,0,.8)",
    },
    userNameButton: {
      marginRight: 12,
    },
    logOutButton: {
    },
  }));
  
  const currentUser = useCurrentUser();
  const debugOptions = useDebugOptions();
  
  async function logOut() {
    await doPost<ApiTypes.ApiLogout>({
      endpoint: "/api/users/logout",
      query: {}, body: {}
    });
    redirect("/");
  }
  
  return <div className={classes.root}>
    <OpenSidebarButton open={sidebarOpen} setOpen={setSidebarOpen} />

    <div className={classes.mainSection}>
      <div className={classes.siteName}>
        <Link href="/" color={false}>
          Spaced Repetition Reader
        </Link>
      </div>
      
      {debugOptions.overrideDate && <>
        <div className={classes.simulatedDate}>
          Simulated date: {debugOptions.overrideDate.toISOString()}
        </div>
      </>}
      {currentUser && <div className={classes.topBarButtons}>
        <Link href="/profile" className={classes.userNameButton} color={false}>
          {currentUser.name}
        </Link>
        <Link onClick={logOut} className={classes.logOutButton} color={false}>
          Log Out
        </Link>
      </div>}
      {!currentUser && <>
        <Link href="/login" className="logInButton">Log In</Link>
      </>}
    </div>
  </div>;
}

export function OpenSidebarButton({open, setOpen}: {
  open: boolean|undefined
  setOpen: (open: boolean)=>void
}) {
  const classes = useJssStyles("OpenSidebarButton", () => ({
    button: {
      cursor: "pointer",
      fontSize: 26,
      paddingLeft: 8,
      paddingRight: 8,
      paddingBottom: 16,
      paddingTop: 6,
      color: "rgba(0,0,0,.7)",
      
      "&:hover": {
        color: "rgba(0,0,0,1)",
      },
    },
  }));

  function onClick() {
    const isDefaultOpen = window.matchMedia("(min-width: 600px)")?.matches;
    if (open === undefined) {
      setOpen(!isDefaultOpen);
    } else {
      setOpen(!open);
    }
  }

  return <span className={classes.button} onClick={onClick}>
    ☰
  </span>
}

export function LeftSidebar({open, setOpen:_}: {
  open?: boolean
  setOpen: (open: boolean)=>void
}) {
  const classes = useJssStyles("LeftSidebar", () => ({
    root: {
      position: "absolute",
      top: 48, bottom: 0,
      width: 200,
      boxSizing: "border-box",
      
      background: "#eef",
      padding: 16,

      transition: "left 0.5s ease",
    },
    initial: {
      [breakpoints.xs]: {
        left: -200,
      },
      [breakpoints.smUp]: {
        left: 0,
      },
    },
    closed: {
      left: -200,
    },
    open: {
      left: 0,
    },
  }));

  return <div className={classNames(classes.root, {
    [classes.initial]: open===undefined,
    [classes.open]: open,
    [classes.closed]: open===false,
  })}>
    <LeftSidebarContents/>
  </div>
}

export function LeftSidebarContents() {
  const classes = useJssStyles("LeftSidebarContents", () => ({
    root: {
      "& ul": {
        paddingLeft: 16,
        marginBlockStart: 8,
      },
      "& li": {
      }
    },
    currentPageLink: {
      textDecoration: "underline",
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
      <Link
        href="/dashboard"
        color={false}
        highlightIfAlreadyHere={classes.currentPageLink}
      >
        Review
      </Link>
    </div>
    
    <div className={classes.spacer}/>
    
    <div className={classes.sidebarSection}>
      <Link
        href="/decks/manage"
        color={false}
        className={classes.sectionHeader}
        highlightIfAlreadyHere={classes.currentPageLink}
      >
        Decks
      </Link>
      <div className={classes.sectionBody}>
        {loadingDecks && <Loading/>}
        {decksResponse?.decks && decksResponse.decks.map(deck => <div key={""+deck.id}>
          <DeckListItem deck={deck}/>
        </div>)}
        <Link
          href="/decks/manage"
          color={true}
          highlightIfAlreadyHere={classes.currentPageLink}
        >
          New Deck
        </Link>
      </div>
    </div>
    <div className={classes.sidebarSection}>
      <Link
        href="/feeds/manage"
        color={false}
        className={classes.sectionHeader}
        highlightIfAlreadyHere={classes.currentPageLink}
      >
        Feeds
      </Link>
      <div className={classes.sectionBody}>
        {loadingFeeds && <Loading/>}
        {subscriptionsResponse?.feeds && subscriptionsResponse.feeds.map(feed => <FeedsListItem key={feed.id} feed={feed}/>)}
        <Link
          href="/feeds/add"
          color={true}
          highlightIfAlreadyHere={classes.currentPageLink}
        >
          Add Feed
        </Link>
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
    currentPageLink: {
      textDecoration: "underline",
    },
    unreadCount: {
    },
  }));
  
  return <div className={classes.root}>
    <Link
      href={href}
      color={false} className={classes.link}
      highlightIfAlreadyHere={classes.currentPageLink}
    >
      <div className={classes.title}>
        {title}
      </div>
      {unreadCount>0 && <div className={classes.unreadCount}>
        {unreadCount}
      </div>}
    </Link>
  </div>
}

export const components = {App,PageWrapper,LoggedOutAccessiblePage,TopBar,OpenSidebarButton,LeftSidebar,LeftSidebarContents,DeckListItem,FeedsListItem,SidebarListItemWithCount};
