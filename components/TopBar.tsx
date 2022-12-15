import React from 'react'
import {useCurrentUser} from '../lib/useCurrentUser';
import {Link} from './Link';
import {doPost} from '../lib/apiUtil';
import {redirect} from '../lib/browserUtil';

export function TopBar() {
  const currentUser = useCurrentUser();
  
  async function logOut() {
    await doPost<ApiTypes.ApiLogout>({
      endpoint: "/api/users/logout",
      query: {}, body: {}
    });
    redirect("/");
  }
  
  return <div className="topBar">
    <Link href="/" className="siteNameHeader">
      {"SRSR . SR ... SR"}
    </Link>
    
    {currentUser && <>
      <Link href="/users/profile" className="userNameButton">{currentUser.name}</Link>
      <Link onClick={logOut} className="logOutButton">Log Out</Link>
    </>}
    {!currentUser && <>
      <Link href="/login" className="logInButton">Log In</Link>
    </>}
  </div>;
}
