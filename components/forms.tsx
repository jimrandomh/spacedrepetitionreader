import React, { useState } from 'react'
import { useGetApi, doPost } from '../lib/apiUtil';
import { BulletSeparator, TextInput, TextAreaInput, ErrorMessage, Loading, FeedScrollList, Button, Link } from './widgets';
import { redirect } from '../lib/util/browserUtil';
import { useJssStyles } from '../lib/useJssStyles';
import { useModal, ModalDialog } from '../lib/useModal';
import { getPublicConfig } from '../lib/getPublicConfig';
import { getBrowserTimezone } from '../lib/util/timeUtil';


export function LoginForm() {
  const classes = useJssStyles("LoginForm", () => ({
    root: {},
    logInOrSignUp: {
      display: "flex",
      flexWrap: "wrap",
      justifyContent: "center",
    },
    oauthSection: {
      textAlign: "center",
      margin: 8,
    },
    oauthLink: {
      margin: 8,
    },
    or: {
      color: "rgba(0,0,0,.6)",
      fontSize: 12,
    },
    form: {
      border: "1px solid #ccc",
      padding: 16,
      display: "inline-block",
      verticalAlign: "top",
      margin: 16,
      width: 270,
      height: 200,
    },
    input: {
      marginBottom: 6,

      "& label": {
        minWidth: 80,
      },
      "& input": {
        width: 150,
      },
    },
    formTitle: {
      marginBottom: 8,
      textAlign: "center",
    },
    button: {
      width: 150,
      marginLeft: 80,
      marginTop: 8,
    },
    moreOptionsSection: {
      textAlign: "center",
      fontSize: 12,
      marginTop: 16,
    },
    forgotPasswordLink: {},
  }));
  
  const [loginUsername,setLoginUsername] = useState("");
  const [loginPassword,setLoginPassword] = useState("");
  const [createAccountUsername,setCreateAccountUsername] = useState("");
  const [createAccountEmail,setCreateAccountEmail] = useState("");
  const [createAccountPassword,setCreateAccountPassword] = useState("");
  const [confirmPassword,setConfirmPassword] = useState("");
  const [loginError,setLoginError] = useState<string|null>(null);
  const [signupError,setSignupError] = useState<string|null>(null);
  const hasOAuth = getPublicConfig().enableGoogleOAuth;
  
  async function logIn() {
    const {result:_,error} = await doPost<ApiTypes.ApiLogin>({
      endpoint: "/api/users/login",
      query: {},
      body: {
        username: loginUsername,
        password: loginPassword
      }
    });
    if (error) {
      setLoginError(error);
    } else {
      redirect("/dashboard");
    }
  }
  async function createAccount() {
    if (createAccountUsername==="") {
      setSignupError("Please choose a username.");
      return;
    }
    if (createAccountPassword === "") {
      setSignupError("Please choose a password.");
      return;
    }
    if (createAccountPassword !== confirmPassword) {
      setSignupError("Passwords do not match.");
      return;
    }
    
    const {result:_,error} = await doPost<ApiTypes.ApiSignup>({
      endpoint: "/api/users/signup",
      query: {},
      body: {
        username: createAccountUsername,
        email: createAccountEmail,
        password: createAccountPassword,
        timezone: getBrowserTimezone(),
      }
    });
    if (error) {
      setSignupError(error);
    } else {
      redirect("/dashboard");
    }
  }
  
  return <div className={classes.root}>
    <div className={classes.logInOrSignUp}>
      <form
        className={classes.form}
        onSubmit={(ev) => {ev.preventDefault(); void logIn()}}
      >
        {!hasOAuth && <div className={classes.formTitle}>Log In</div>}
        {hasOAuth && <div className={classes.oauthSection}>
          <div className={classes.oauthLink}>
            <Link href="/auth/google/login" color={true}>
              Log in with Google
            </Link>
          </div>
          <div className={classes.or}>-OR-</div>
        </div>}
        <TextInput label="Username" value={loginUsername} setValue={setLoginUsername} className={classes.input}/>
        <TextInput label="Password" inputType="password" value={loginPassword} setValue={setLoginPassword} className={classes.input}/>
        <input type="submit" value="Log In" className={classes.button}/>
        
        {loginError && <ErrorMessage message={loginError}/>}
      </form>
      <form
        className={classes.form}
        onSubmit={(ev) => {ev.preventDefault(); void createAccount()}}
      >
        <div className={classes.formTitle}>Sign Up</div>
        <TextInput label="Username" value={createAccountUsername} setValue={setCreateAccountUsername} className={classes.input}/>
        <TextInput label="Email" value={createAccountEmail} setValue={setCreateAccountEmail} className={classes.input}/>
        <TextInput label="Password" inputType="password" value={createAccountPassword} setValue={setCreateAccountPassword} className={classes.input}/>
        <TextInput label="Confirm" inputType="password" value={confirmPassword} setValue={setConfirmPassword} className={classes.input}/>
        <input type="submit" value="Create Account" className={classes.button}/>
        
        {signupError && <ErrorMessage message={signupError}/>}
      </form>
    </div>
    <div className={classes.moreOptionsSection}>
      <Link href="/email/forgotPassword" color={false} className={classes.forgotPasswordLink}>
        Forgot Password?
      </Link>
    </div>
  </div>;
}

export function RequestPasswordResetForm() {
  const classes = useJssStyles("RequestPasswordResetForm", () => ({
    root: {
      width: 510,
      margin: "0 auto",
    },
    button: {},
  }));
  
  const [email,setEmail] = useState("");
  const [displayedError,setDisplayedError] = useState<string|null>(null);
  const [finished,setFinished] = useState(false);
  
  async function requestPasswordReset() {
    if (!email.length) {
      setDisplayedError("Enter an email address");
      return;
    }
    setDisplayedError(null);
    const {result:_,error} = await doPost<ApiTypes.ApiRequestPasswordResetEmail>({
      endpoint: "/api/users/requestPasswordReset",
      query: {},
      body: {email}
    });
    
    if (error) {
      setDisplayedError(error);
    } else {
      setFinished(true);
    }
  }
  return <div className={classes.root}>
    {!finished && <form
      onSubmit={(ev) => {ev.preventDefault(); void requestPasswordReset()}}
    >
      <TextInput label="Email" value={email} setValue={setEmail}/>
      <input type="submit" value="Request Password Reset" className={classes.button}/>
      {displayedError && <div><ErrorMessage message={displayedError}/></div>}
    </form>}
    {finished && <div>
      An email was sent to {email}. Click the link in the email to reset your password.
    </div>}
  </div>
}

export function ResetPasswordForm({token}: {
  token: string
}) {
  const classes = useJssStyles("ResetPasswordForm", () => ({
    root: {
      width: 510,
      margin: "0 auto",
    },
    form: {},
    button: {},
    input: {},
  }));
  const [newPassword,setNewPassword] = useState("");
  const [confirmPassword,setConfirmPassword] = useState("");
  const [displayedError,setDisplayedError] = useState<string|null>(null);

  async function resetPassword() {
    if (newPassword !== confirmPassword) {
      setDisplayedError("Passwords do not match");
      return;
    }
    if (!newPassword.length) {
      setDisplayedError("Please choose a password");
    }
    const {result:_,error} = await doPost<ApiTypes.ApiResetPassword>({
      endpoint: "/api/users/resetPassword",
      query: {},
      body: {
        token,
        password: newPassword
      },
    });
    if (error) {
      setDisplayedError(error);
    } else {
      setDisplayedError(null);
    }
  }

  return <div className={classes.root}>
    <form
      className={classes.form}
      onSubmit={(ev) => {ev.preventDefault(); void resetPassword()}}
    >
      <TextInput
        label="Password" inputType="password"
        value={newPassword} setValue={setNewPassword}
        className={classes.input}
      />
      <TextInput
        label="Confirm" inputType="password"
        value={confirmPassword} setValue={setConfirmPassword}
        className={classes.input}
      />
      {displayedError && <ErrorMessage message={displayedError}/>}
      <input type="submit" value="Reset Password" className={classes.button}/>
    </form>
  </div>;
}

export function CreateCardForm({deck}: {
  deck: ApiTypes.ApiObjDeck
}) {
  const classes = useJssStyles("CreateCardForm", () => ({
    form: {
    },
  }));
  
  const [cardFront,setCardFront] = useState("");
  const [cardBack,setCardBack] = useState("");
  const [error,setError] = useState<string|null>(null);
  
  async function createCard() {
    if(!cardFront || !cardBack) {
      setError("You must provide a front and back.");
      return;
    }
    const {result:_,error} = await doPost<ApiTypes.ApiCreateCard>({
      endpoint: "/api/cards/create",
      query: {},
      body: {
        deckId: deck.id,
        front: cardFront,
        back: cardBack,
      }
    });
    if(error) {
      setError(error);
    } else {
      redirect(`/decks/edit/${deck.id}`);
    }
  }
  
  return <div>
    <form
      className={classes.form}
      onSubmit={(ev) => {ev.preventDefault(); void createCard()}}
    >
      <TextAreaInput label="Front" value={cardFront} setValue={setCardFront}/>
      <TextAreaInput label="Back" value={cardBack} setValue={setCardBack}/>
      <input type="submit" value="Create Card"/>
      
      {error && <ErrorMessage message={error}/>}
    </form>
  </div>;
}

export function CreateDeckForm() {
  const [deckName,setDeckName] = useState("");
  const [error,setError] = useState<string|null>(null);
  
  async function createDeck() {
    if(!deckName) {
      setError("You must provide a name.");
      return;
    }
    const {result,error} = await doPost<ApiTypes.ApiCreateDeck>({
      endpoint: "/api/decks/create",
      query: {},
      body: {
        name: deckName
      }
    });
    if (error!==null) {
      setError(error);
    } else {
      redirect(`/decks/edit/${result.id}`);
    }
  }
  
  return <div>
    <form onSubmit={(ev) => {ev.preventDefault(); void createDeck()}}>
      <TextInput label="Name" value={deckName} setValue={setDeckName}/>
      <input type="submit" value="Create Deck"/>
      {error && <ErrorMessage message={error}/>}
    </form>
  </div>;
}

export function SubscribeToFeedForm() {
  const [feedUrl,setFeedUrl] = useState("");
  const [error,setError] = useState<string|null>(null);
  const {openModal} = useModal();
  
  function previewFeed() {
    if (feedUrl==="") return;
    
    openModal({
      fn: (onClose) => {
        return <ModalDialog>
          <FeedPreview
            feedUrl={feedUrl}
            onError={err => setError(err)}
            onClose={onClose}
          />
        </ModalDialog>
      }
    })
  }
  
  return <div>
    <form onSubmit={(ev) => {ev.preventDefault(); previewFeed()}}>
      <TextInput label="Page, RSS or Atom URI" value={feedUrl} setValue={setFeedUrl}/>
      <input type="submit" value="Preview"/>
      {error && <ErrorMessage message={error}/>}
    </form>
  </div>
}

export function FeedPreview({feedUrl,onError,onClose}: {
  feedUrl: string
  onError: (message: string)=>void
  onClose: ()=>void
}) {
  const classes = useJssStyles("FeedPreview", () => ({
    scrollingRegion: {
      maxHeight: 400,
      overflowY: "scroll",
    },
  }));
  
  const {loading,data} = useGetApi<ApiTypes.ApiGetFeedPreview>({
    endpoint: "/api/feeds/preview/:url",
    query: {url: feedUrl},
  });
  
  async function subscribe() {
    if (data && data.url) {
      const {result,error} = await doPost<ApiTypes.ApiSubscribeToFeed>({
        endpoint: "/api/feeds/subscribe",
        query: {}, body: {feedUrl: data.url},
      });
      
      if (error!==null) {
        onError(error);
        onClose();
      } else {
        const feedId = result.feedId;
        redirect(`/feeds/${feedId}`);
      }
    }
  }
  function cancel() {
    onClose();
  }
  
  if (loading || !data) {
    return <Loading/>
  }
  if (!data.success) {
    return <div>
      <div>Could not load feed: {data.error}</div>
      <Button label="Cancel" onClick={cancel}/>
    </div>
  }
  
  return <div>
    <h1>Feed Preview</h1>
    <div>{data.url}</div>
    
    {loading && <Loading/>}
    {data && <>
      <div className={classes.scrollingRegion}>
        <FeedScrollList items={data.items}/>
      </div>
    
      <Button label="Subscribe" onClick={subscribe}/>
      <Button label="Cancel" onClick={cancel}/>
    </>}
  </div>
}

export const components = {LoginForm,RequestPasswordResetForm,ResetPasswordForm,CreateCardForm,CreateDeckForm,SubscribeToFeedForm,FeedPreview};
