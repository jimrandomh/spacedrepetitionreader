import * as React from 'react'
import {TopBar} from '../components/TopBar';
import {LeftSidebar} from '../components/LeftSidebar';

export function FrontPage() {
  return <div className="frontPage">
    <TopBar/>
    <LeftSidebar/>
    
    <div className="mainPane">
    </div>
  </div>
}
