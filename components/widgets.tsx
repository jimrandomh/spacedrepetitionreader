import React, {useEffect} from 'react'
import {useJssStyles} from '../lib/useJssStyles';
import {redirect} from '../lib/util/browserUtil';
import classNames from 'classnames';
import { useLocation } from '../lib/useLocation';


export function Link({href, onClick, alwaysNewTab=false, highlightIfAlreadyHere, className, color=true, children}: {
  href?: string
  onClick?: ()=>void
  alwaysNewTab?: boolean,
  highlightIfAlreadyHere?: boolean|string,
  className?: string
  color?: boolean
  children: React.ReactNode
}) {
  const classes = useJssStyles("Link", () => ({
    link: {
      textDecoration: "none",
      
      "&:hover": {
        textDecoration: "underline",
      }
    },
    currentPage: {
      textDecoration: "underline",
    },
    noColor: {
      color: "inherit"
    },
  }));
  
  const location = useLocation();
  const isCurrentPage = href && (location.url === href);
  let alreadyHereHighlight: string|null = null;
  if (isCurrentPage && highlightIfAlreadyHere) {
    if (highlightIfAlreadyHere===true) {
      alreadyHereHighlight = classes.currentPage;
    } else {
      alreadyHereHighlight = highlightIfAlreadyHere;
    }
  }
  
  return <a
    onClick={onClick
      ? (ev => {
          ev.preventDefault();
          onClick()
        })
      : undefined
    }
    className={classNames(
      classes.link, className, alreadyHereHighlight,
      {
        [classes.noColor]: !color,
      }
    )}
    href={href || "#"}
    {...alwaysNewTab  && {
      target: "_blank",
      rel: "noopener"
    }}
  >
    {children}
  </a>;
}

export function ErrorMessage({message}: {
  message: string
}) {
  const classes = useJssStyles("ErrorMessage", () => ({
    errorMessage: {
      color: "#ff0000",
    }
  }));
  return <div className={classes.errorMessage}>{message}</div>
}

export function Loading() {
  const classes = useJssStyles("Loading", () => ({
    loading: {
      width: 32,
      height: 32,
    }
  }));
  return <img className={classes.loading} src="/static/loading.gif"/>
}

export function TextAreaInput({label, value, setValue}: {
  label: string,
  value: string,
  setValue: (newValue: string)=>void,
}) {
  const classes = useJssStyles("TextAreaInput", () => ({
    root: {
    },
    label: {
    },
    textarea: {
      width: 500,
      height: 150,
    },
  }));
  return <div className={classes.root}>
    <div className={classes.label}>{label}</div>
    <textarea
      className={classes.textarea}
      value={value}
      onChange={ev=>setValue(ev.target.value)}
    />
  </div>
}

export function TextInput({label, placeholder, value, setValue, inputType, className, inputClassName}: {
  label?: string,
  placeholder?: string,
  value: string,
  setValue: (newValue: string)=>void,
  inputType?: string,
  className?: string,
  inputClassName?: string,
}) {
  const classes = useJssStyles("TextInput", () => ({
    root: {
    },
    label: {
      display: "inline-block",
      minWidth: 130,
    },
    input: {
      width: 280,
      padding: 6,
    },
  }));
  
  return <div className={classNames(className,classes.root)}>
    {label && <label className={classes.label}>{label}</label>}
    <input
      value={value}
      onChange={ev=>setValue(ev.target.value)}
      placeholder={placeholder}
      type={inputType||"text"}
      className={classNames(classes.input, inputClassName)}
    />
  </div>
}

export function Checkbox({label, className, value, setValue}: {
  label: string|React.ReactNode,
  className?: string,
  value: boolean,
  setValue: (checked: boolean)=>void,
}) {
  const classes = useJssStyles("Checkbox", () => ({
    checkbox: {
      margin: 0,
    },
    label: {
      marginLeft: 6,
    },
  }));

  return <div className={className}>
    <input
      type="checkbox" className={classes.checkbox}
      checked={value} onChange={ev => setValue(ev.target.checked)}
    />
    <span className={classes.label}>{label}</span>
  </div>
}

export function BulletSeparator() {
  const classes = useJssStyles("BulletSeparator", () => ({
    bullet: {
      cursor: "default",
    },
  }));
  return <span className={classes.bullet}>{" • "}</span>
}

export function FeedScrollList({items}: {
  items: ApiTypes.ApiObjRssItem[]
}) {
  return <>
    {items.map((feedItem,i) =>
      <FeedItemFrame key={feedItem.id || (""+i)}>
        <FeedItem item={feedItem}/>
      </FeedItemFrame>
    )}
  </>
}
export function FeedItem({item}: {
  item: ApiTypes.ApiObjRssItem
}) {
  const classes = useJssStyles("FeedItem", () => ({
    root: {
      "& img": {
        maxWidth: "100%",
      },
    },
    rssTitle: {
      marginBottom: 12,
      fontSize: 20,
    },
    rssBody: {},
    date: {
      fontSize: 14,
      color: "#444",
    },
  }));
  return <div className={classes.root}>
    <div className={classes.rssTitle}>
      <Link href={item.link} alwaysNewTab={true}>
        {item.title}
      </Link>
      <div className={classes.date}>{item.pubDate}</div>
    </div>
    <div
      className={classes.rssBody}
      dangerouslySetInnerHTML={{__html: item.summary}}
    />
  </div>
}

export function FeedItemFrame({children}: {
  children: React.ReactNode,
}) {
  const classes = useJssStyles("FeedItemFrame", () => ({
    root: {
      border: "1px solid #888",
      marginLeft: "auto",
      marginRight: "auto",
      marginBottom: 16,
      padding: 16,
      maxWidth: 600,
      borderRadius: 8,
    },
  }));
  
  return <div className={classes.root}>
    {children}
  </div>
}

export function Button({label,onClick}: {
  label: string
  onClick: ()=>void
}) {
  const classes = useJssStyles("Button", () => ({
    button: {
      display: "inline-block",
      cursor: "pointer",
      padding: 8,
      minWidth: 80,
      margin: 8,
      border: "1px solid #999",
      borderRadius: 8,
      textAlign: "center",
      
      "&:hover": {
        background: "#eee",
      },
    },
  }));
  return <div
    className={classes.button}
    onClick={onClick}
  >
    {label}
  </div>
}

export function Redirect({to}: {to: string}) {
  useEffect(() => {
    if(to) {
      redirect(to);
    }
  }, [to]);
  
  return null;
}


export const components = {Link,ErrorMessage,Loading,TextAreaInput,TextInput,Checkbox,BulletSeparator,FeedScrollList, FeedItem,FeedItemFrame,Button,Redirect};
