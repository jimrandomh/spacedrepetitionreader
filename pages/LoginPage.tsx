import React, {useState} from 'react'
import type {ApiLogin,ApiSignup} from '../lib/apiTypes';
import {doPost} from '../lib/apiUtil';

export function LoginPage() {
  const [loginUsername,setLoginUsername] = useState("");
  const [loginPassword,setLoginPassword] = useState("");
  const [createAccountUsername,setCreateAccountUsername] = useState("");
  const [createAccountEmail,setCreateAccountEmail] = useState("");
  const [createAccountPassword,setCreateAccountPassword] = useState("");
  const [confirmPassword,setConfirmPassword] = useState("");
  const [error,setError] = useState<string|null>(null);
  
  async function logIn() {
    await doPost<ApiLogin>({
      endpoint: "/api/users/login",
      query: {},
      body: {
        username: loginUsername,
        password: loginPassword
      }
    });
    // TODO: Show error or redirect
  }
  async function createAccount() {
    if (createAccountPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    
    await doPost<ApiSignup>({
      endpoint: "/api/users/signup",
      query: {},
      body: {
        username: createAccountUsername,
        email: createAccountEmail,
        password: createAccountPassword
      }
    });
    // TODO: Show error or redirect
  }
  
  return <div>
    <form onSubmit={(ev) => {ev.preventDefault(); logIn()}}>
      <div>Log in:</div>
      <div>
        Username <input
          value={loginUsername}
          onChange={ev=>setLoginUsername(ev.target.value)}
        />
      </div>
      <div>
        Password <input
          type="password"
          value={loginPassword}
          onChange={ev=>setLoginPassword(ev.target.value)}
        />
      </div>
      <input type="submit" value="Log In"/>
    </form>
    <form onSubmit={(ev) => {ev.preventDefault(); createAccount()}}>
      <div>Sign up</div>
      <div>
        Username
        <input
          value={createAccountUsername}
          onChange={ev=>setCreateAccountUsername(ev.target.value)}
        />
      </div>
      <div>
        Email
        <input
          value={createAccountEmail}
          onChange={ev=>setCreateAccountEmail(ev.target.value)}
        />
      </div>
      <div>
        Password <input
          type="password"
          value={createAccountPassword}
          onChange={ev=>setCreateAccountPassword(ev.target.value)}
        />
      </div>
      <div>
        Confirm Password <input
          type="password"
          value={confirmPassword}
          onChange={ev=>setConfirmPassword(ev.target.value)}
        />
      </div>
      <input type="submit" value="Create Account"/>
      
      {error && <div className="error">{error}</div>}
    </form>
  </div>;
}
