import React from 'react'
import {TopBar} from '../components/TopBar';
import {LeftSidebar} from '../components/LeftSidebar';

export function PageWrapper({children}: {
  children: React.ReactNode
}) {
  return <div className="frontPage">
    <TopBar/>
    <LeftSidebar/>
    <div className="mainPane">
      {children}
    </div>
  </div>
}
