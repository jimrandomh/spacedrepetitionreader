import React from 'react'
import {useJssStyles} from '../lib/useJssStyles';

export function Link({href, onClick, className, children}: {
  href?: string
  onClick?: ()=>void
  className?: string
  children: React.ReactNode
}) {
  return <a onClick={onClick ? ((ev) => onClick()) : undefined} className={className} href={href}>
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
  return <span className={classes.errorMessag}>{message}</span>
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
  return <div>
    <div>{label}</div>
    <textarea
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
  return <div>
    {label}
    <input
      value={value}
      onChange={ev=>setValue(ev.target.value)}
      type={inputType||"text"}
    />
  </div>
}
