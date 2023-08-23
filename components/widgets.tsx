import React, {useEffect} from 'react'
import {useJssStyles} from '../lib/useJssStyles';
import {redirect} from '../lib/browserUtil';
import classNames from 'classnames';


export function Link({href, onClick, alwaysNewTab=false, className, color=true, children}: {
  href?: string
  onClick?: ()=>void
  alwaysNewTab?: boolean,
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
    noColor: {
      color: "inherit"
    },
  }));
  
  return <a
    onClick={onClick
      ? (ev => {
          ev.preventDefault();
          onClick()
        })
      : undefined
    }
    className={classNames(
      classes.link, className,
      {[classes.noColor]: !color}
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
  return <span className={classes.errorMessage}>{message}</span>
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

export function TextInput({label, value, setValue, inputType, className}: {
  label: string,
  value: string,
  setValue: (newValue: string)=>void,
  inputType?: string,
  className?: string,
}) {
  const classes = useJssStyles("TextInput", () => ({
    root: {
    },
    label: {
      display: "inline-block",
      minWidth: 130,
    },
    input: {
    },
  }));
  
  return <div className={classNames(className,classes.root)}>
    <label className={classes.label}>{label}</label>
    <input
      value={value}
      onChange={ev=>setValue(ev.target.value)}
      type={inputType||"text"}
      className={classes.input}
    />
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


export const components = {Link,ErrorMessage,Loading,TextInput,TextAreaInput,BulletSeparator,FeedScrollList, FeedItem,FeedItemFrame,Button,Redirect};
