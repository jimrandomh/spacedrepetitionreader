import React,{useState} from 'react'
import {useJssStyles} from '../lib/useJssStyles';
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
    onClick={onClick ? ((ev) => onClick()) : undefined}
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

export function Counter() {
  const [count,setCount] = useState(0);
  
  return <div>
    {count} <span onClick={(ev) => {setCount(count+1)}}>(+)</span>
  </div>
}

export function FeedItem({item}: {
  item: ApiTypes.ApiObjRssItem
}) {
  const classes = useJssStyles("FeedItem", () => ({
    rssTitle: {},
    rssBody: {},
  }));
  return <div>
    <div className={classes.rssTitle}>{item.title}</div>
    <div className={classes.rssBody}>
      <div dangerouslySetInnerHTML={{__html: item.summary}}/>
    </div>
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
