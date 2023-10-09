import React,{useCallback, useEffect} from 'react'
import {LoggedOutAccessiblePage} from '../layout';
import { LoginForm, RequestPasswordResetForm, ResetPasswordForm } from '../forms';
import {Loading} from '../widgets';
import {doPost} from '../../lib/apiUtil';
import {redirect} from '../../lib/util/browserUtil';
import {useJssStyles} from '../../lib/useJssStyles';
import { getBrowserTimezone } from '../../lib/util/timeUtil';
import { PageTitle } from '../../lib/renderContext';
import { PitchText } from './metaPages';



export function LoginPage() {
  return <LoggedOutAccessiblePage title="Login">
    <LoginForm/>
  </LoggedOutAccessiblePage>
}

/**
 * When you log in with OAuth for the first time, you go to this page
 * (/first-oauth-login) first. It checks the timezone in your browser, updates
 * your user settings with that timezone, then redirects you to /dashboard. (We
 * don't need to do this for password-login signups, because the create-account
 * form submits the timezone.)
 */
export function FirstOAuthLoginPage() {
  const _classes = useJssStyles("FirstOAuthLoginPage", () => ({
  }));

  useEffect(() => {
    void (async () => {
      const {result:_1, error:_2} = await doPost<ApiTypes.ApiChangeUserConfig>({
        endpoint: "/api/users/changeConfig",
        query: {},
        body: { config: {
          timezone: getBrowserTimezone(),
        }},
      });
      redirect("/dashboard");
    })();
  }, []);
  
  return <Loading/>
}

export function ForgotPasswordRequestPage() {
  return <LoggedOutAccessiblePage title="Forgot Password">
    <RequestPasswordResetForm/>
  </LoggedOutAccessiblePage>
}

export function ResetPasswordPage({token}: {token: string}) {
  return <LoggedOutAccessiblePage title="Reset Password">
    <ResetPasswordForm token={token} />
  </LoggedOutAccessiblePage>
}

export function ConfirmEmailPage({token}: {token: string}) {
  const doConfirm = useCallback(async () => {
    await doPost<ApiTypes.ApiConfirmEmail>({
      endpoint: "/api/users/confirmEmail",
      query: {}, body: {token}
    });
  }, [token]);

  useEffect(() => {
    void (async () => {
      await doConfirm();
      redirect("/dashboard");
    })();
  }, [doConfirm]);
  
  return <div>
    <PageTitle title="Confirming Email Address"/>
    <Loading/>
  </div>
}


export const components = {PitchText,LoginPage,FirstOAuthLoginPage,ForgotPasswordRequestPage,ResetPasswordPage,ConfirmEmailPage};
