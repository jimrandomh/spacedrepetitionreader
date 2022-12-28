import React, {useEffect} from 'react'
import {useJssStyles} from '../lib/useJssStyles';
import {redirect} from '../lib/browserUtil';
import classNames from 'classnames';


export function Link({href, onClick, className, color=true, children}: {
  href?: string
  onClick?: ()=>void
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
    onClick={onClick ? (_ev => onClick()) : undefined}
    className={classNames(
      classes.link, className,
      {[classes.noColor]: !color}
    )}
    href={href || "#"}
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

export function TextInput({label, value, setValue, inputType}: {
  label: string,
  value: string,
  setValue: (newValue: string)=>void,
  inputType?: string,
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
  
  return <div className={classes.root}>
    <span className={classes.label}>{label}</span>
    <input
      value={value}
      onChange={ev=>setValue(ev.target.value)}
      type={inputType||"text"}
      className={classes.input}
    />
  </div>
}

export function BulletSeparator() {
  return <span>{" • "}</span>
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
  }));
  return <div className={classes.root}>
    <div className={classes.rssTitle}>
      <Link href={item.link}>{item.title}</Link>
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
