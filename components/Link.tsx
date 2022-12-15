import React from 'react'

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
