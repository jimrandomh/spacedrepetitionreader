import React, { useState } from 'react'
import { useCurrentUser } from '../lib/useCurrentUser';
import {BulletSeparator, Link, Loading} from './widgets';
import {useGetApi,doPost} from '../lib/apiUtil';
import {redirect} from '../lib/util/browserUtil';
import {useJssStyles} from '../lib/useJssStyles';
import { ModalDialog, useModal} from '../lib/useModal';
import {DebugPanel, useDebugOptions} from './debug';
import classNames from 'classnames';
import {breakpoints} from '../lib/breakpoints';
import { PageTitle } from '../lib/renderContext';
import { groupBy } from 'lodash';


export function PageWrapper({title, layout="full", children}: {
  title: string|null,
  layout?: "full"|"centered",
  children: React.ReactNode
}) {
  const classes = useJssStyles("PageWrapper", () => ({
    mainColumn: {
      position: "absolute",
      top: 48, bottom: 0,
      right: 0,
      overflowY: "scroll",
      left: 0,
      transition: "left 0.5s ease",
    },
    sidebarIsAuto: {
      [breakpoints.smUp]: {
        left: 200,
      }
    },
    sidebarIsOpen: {
      left: 200,
    },
    body: {
      minHeight: "calc(100% - 40px)",
      padding: 16,
    },
    full: {
    },
    centered: {
      maxWidth: 600,
      margin: "0 auto",
    },
  }));

  const [sidebarOpen,setSidebarOpen] = useState<boolean|undefined>(undefined);
  
  return <div>
    {title && <PageTitle title={title}/>}
    <TopBar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}/>
    <LeftSidebar open={sidebarOpen} setOpen={setSidebarOpen} />
    <div className={classNames(classes.mainColumn, {
      [classes.sidebarIsAuto]: sidebarOpen===undefined,
      [classes.sidebarIsOpen]: sidebarOpen,
    })}>
      <div className={classNames(classes.body, {
        [classes.full]: layout==="full",
        [classes.centered]: layout==="centered",
      })}>
        {children}
      </div>
      <FooterLinks/>
    </div>
  </div>
}

function FooterLinks() {
  const classes = useJssStyles("FooterLinks", () => ({
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

  const canDebug = true; //TODO
  const {openModal} = useModal();

  const openDebugPanel = () => {
    openModal({
      fn: (onClose) => {
      return <ModalDialog>
        <DebugPanel onClose={onClose}/>
       </ModalDialog>
      }
    });
  }

  return <div className={classes.footer}>
    {canDebug && <>
      <Link onClick={openDebugPanel} color={false}>Debug</Link>
      <BulletSeparator/>
    </>}
    <Link href="/about" color={false}>About</Link>
    <BulletSeparator/>
    <Link href="mailto:jimrandomh@gmail.com" color={false}>Feedback</Link>
    <BulletSeparator/>
    <Link href="/privacy-policy" color={false}>Privacy Policy</Link>
    <BulletSeparator/>
    <Link href="https://www.github.com/jimrandomh/spacedrepetitionreader" color={false}>GitHub</Link>
  </div>
}

export function LoggedOutAccessiblePage({title, children}: {
  title: string|null,
  children: React.ReactNode,
}) {
  const classes = useJssStyles("LoggedOutAccessiblePage", () => ({
    loggedOutPage: {
      marginTop: 32,
    }
  }));
  const currentUser = useCurrentUser();
  
  // Show the side and top bars iff logged in
  if (currentUser) {
    return <PageWrapper title={title}>
      {children}
    </PageWrapper>
  } else {
    return <div className={classes.loggedOutPage}>
      {title && <PageTitle title={title}/>}
      {children}
    </div>
  }
}

function TopBar({sidebarOpen, setSidebarOpen}: {
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
    siteNameShort: {
      display: "none",
      [breakpoints.xs]: {
        display: "inline-block",
      },
    },
    siteNameLong: {
      display: "none",
      [breakpoints.smUp]: {
        display: "inline-block",
      },
    },
    simulatedDate: {
      marginRight: 8,
    },
    topBarButtons: {
      fontWeight: 300,
      fontSize: 12,
      marginTop: 8,
      color: "rgba(0,0,0,.8)",
      display: "flex",
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
          <span className={classes.siteNameShort}>S.R.R.</span>
          <span className={classes.siteNameLong}>Spaced Repetition Reader</span>
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

function OpenSidebarButton({open, setOpen}: {
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

function LeftSidebar({open, setOpen:_}: {
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

function LeftSidebarContents() {
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
    feedCategoryBlock: {
    },
    feedCategoryHeading: {
      marginBottom: 6,
    },
    feedCategoryContents: {
      paddingLeft: 16,
    },
  }));
  
  const currentUser = useCurrentUser();

  const {loading: loadingDecks, data: decksResponse} = useGetApi<ApiTypes.ApiListDecks>({
    endpoint: "/api/decks/list",
    query: {}
  });
  
  const {loading: loadingFeeds, data: subscriptionsResponse} = useGetApi<ApiTypes.ApiListSubscriptions>({
    endpoint: "/api/feeds/subscribed",
    query: {}
  });
  
  const subscriptionsInCategories = subscriptionsResponse?.feeds.filter(f=>!!f.subscription.config.category);
  const uncategorizedSubscriptions = subscriptionsResponse?.feeds.filter(f=>!f.subscription.config.category) ?? [];
  const subscriptionsByCategory = groupBy(subscriptionsInCategories, f=>f.subscription.config.category) ?? [];
  const categories = Object.keys(subscriptionsByCategory);
  
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
        {uncategorizedSubscriptions.map(f => <SubscriptionListItem key={f.feed.id} feed={f}/>)}
        {categories.map(c => <div key={c} className={classes.feedCategoryBlock}>
          <div className={classes.feedCategoryHeading}>{c}</div>
          <div className={classes.feedCategoryContents}>
            {subscriptionsByCategory[c].map(f => <SubscriptionListItem key={f.feed.id} feed={f}/>)}
          </div>
        </div>)}
        {subscriptionsResponse?.feeds.length===0 && <Link
          href="/feeds/manage"
          color={true}
          highlightIfAlreadyHere={classes.currentPageLink}
        >
          Add Feed
        </Link>}
      </div>
    </div>
    
    {currentUser?.isAdmin && <div className={classes.sidebarSection}>
      <Link
        href="/admin/dashboard"
        color={false}
        className={classes.sectionHeader}
        highlightIfAlreadyHere={classes.currentPageLink}
      >
        Admin
      </Link>
    </div>}
  </div>;
}

function DeckListItem({deck}: {
  deck: ApiTypes.ApiObjDeckWithDueCount
}) {
  return <SidebarListItemWithCount
    title={deck.name}
    href={`/decks/edit/${deck.id}`}
    unreadCount={deck.due}
  />
}

function SubscriptionListItem({feed}: {
  feed: ApiTypes.ApiObjFeedWithSubscription
}) {
  return <SidebarListItemWithCount
    title={feed.feed.title || feed.feed.url}
    href={`/feeds/${feed.feed.id}`}
    unreadCount={feed.unreadCount}
  />
}

function SidebarListItemWithCount({title, href, unreadCount}: {
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

export const components = {PageWrapper,FooterLinks,LoggedOutAccessiblePage,TopBar,OpenSidebarButton,LeftSidebar,LeftSidebarContents,DeckListItem,SubscriptionListItem,SidebarListItemWithCount};
