import React from 'react'
import {useCurrentUser} from '../lib/useCurrentUser';

export function TopBar() {
  const currentUser = useCurrentUser();
  
  return <div className="topBar">
    <div className="siteNameHeader">SRSR . SR ... SR</div>
    
    {currentUser && <>
      <div className="userNameButton">{currentUser.name}</div>
      <div className="logOutButton">Log Out</div>
    </>}
    {!currentUser && <>
      <div className="logInButton">Log In</div>
    </>}
  </div>;
}
