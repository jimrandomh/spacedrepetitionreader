import React,{useEffect} from 'react'
import {LoggedOutAccessiblePage} from '../layout';
import {redirect} from '../../lib/util/browserUtil';
import { useLocation } from '../../lib/useLocation';


export function Error404Page() {
  return <LoggedOutAccessiblePage title="404">
    <h1>Page Not Found</h1>
  </LoggedOutAccessiblePage>
}

export function ErrorAccessDeniedPage() {
  return <LoggedOutAccessiblePage title="Access Denied">
    <h1>Access Denied</h1>
    <p>Sorry, you do not have access to this page. If you followed a link that someone shared with you, they may need to edit the sharing settings.</p>
  </LoggedOutAccessiblePage>
}

export function RedirectToLoginPage() {
  const { url } = useLocation();

  useEffect(() => {
    const encodedUrl = encodeURIComponent(url);
    redirect(`/login?redirect=${encodedUrl}`);
  });

  return <div>Redirecting to /login</div>
}

export const components = {Error404Page,ErrorAccessDeniedPage,RedirectToLoginPage};
