import * as React from 'react'
import {TopBar} from '../components/TopBar';
import {LeftSidebar} from '../components/LeftSidebar';
import {CardChallenge} from '../components/CardChallenge';

export function FrontPage() {
  return <div className="frontPage">
    <TopBar/>
    <LeftSidebar/>
    
    <div className="mainPane">
      <CardChallenge card={{
        front: "Why do people stop using spaced repetition apps?",
        back: "Homework assigned by your past self is still homework",
      }}/>
    </div>
  </div>
}
