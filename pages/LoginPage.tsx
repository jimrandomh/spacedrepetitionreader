import React, {useState} from 'react'
import {doPost} from '../lib/apiUtil';
import {TextInput} from '../components/TextInput';
import {ErrorMessage} from '../components/ErrorMessage';
import {redirect} from '../lib/browserUtil';

export function LoginPage() {
  const [loginUsername,setLoginUsername] = useState("");
  const [loginPassword,setLoginPassword] = useState("");
  const [createAccountUsername,setCreateAccountUsername] = useState("");
  const [createAccountEmail,setCreateAccountEmail] = useState("");
  const [createAccountPassword,setCreateAccountPassword] = useState("");
  const [confirmPassword,setConfirmPassword] = useState("");
  const [error,setError] = useState<string|null>(null);
  
  async function logIn() {
    const {result,error} = await doPost<ApiTypes.ApiLogin>({
      endpoint: "/api/users/login",
      query: {},
      body: {
        username: loginUsername,
        password: loginPassword
      }
    });
    if (error) {
      setError(error);
    } else {
      redirect("/");
    }
  }
  async function createAccount() {
    if (createAccountPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    
    const {result,error} = await doPost<ApiTypes.ApiSignup>({
      endpoint: "/api/users/signup",
      query: {},
      body: {
        username: createAccountUsername,
        email: createAccountEmail,
        password: createAccountPassword
      }
    });
    if (error) {
      setError(error);
    } else {
      redirect("/");
    }
  }
  
  return <div>
    <form onSubmit={(ev) => {ev.preventDefault(); logIn()}}>
      <div>Log in:</div>
      <TextInput label="Username" value={loginUsername} setValue={setLoginUsername}/>
      <TextInput label="Password" inputType="password" value={loginPassword} setValue={setLoginPassword}/>
      <input type="submit" value="Log In"/>
    </form>
    <form onSubmit={(ev) => {ev.preventDefault(); createAccount()}}>
      <TextInput label="SignUp" value={createAccountUsername} setValue={setCreateAccountUsername}/>
      <TextInput label="Email" value={createAccountEmail} setValue={setCreateAccountEmail}/>
      <TextInput label="Password" inputType="password" value={createAccountPassword} setValue={setCreateAccountPassword}/>
      <TextInput label="Confirm Password" inputType="password" value={confirmPassword} setValue={setConfirmPassword}/>
      <input type="submit" value="Create Account"/>
      
      {error && <div><ErrorMessage message={error}/></div>}
    </form>
  </div>;
}
