import React, {useState} from 'react'
import {useGetApi,doPost} from '../lib/apiUtil';
import {TextInput,TextAreaInput,ErrorMessage,Loading,FeedScrollList,Button} from './widgets';
import {redirect} from '../lib/browserUtil';
import {useJssStyles} from '../lib/useJssStyles';
import {useModal,ModalDialog} from '../lib/useModal';


export function LoginForm() {
  const classes = useJssStyles("LoginForm", () => ({
    root: {
      width: 510,
      margin: "0 auto",
    },
    form: {
      border: "1px solid #ccc",
      padding: 16,
      display: "inline-block",
      verticalAlign: "top",
      margin: 16,
      width: 220,
      height: 165,
    },
    input: {
      "& label": {
        minWidth: 80,
      },
      "& input": {
        width: 100,
      },
    },
    formTitle: {
      marginBottom: 8,
      textAlign: "center",
    },
    button: {
      width: 100,
      marginLeft: 80,
      marginTop: 8,
    },
    oauthSection: {
      marginTop: 16,
    },
  }));
  
  const [loginUsername,setLoginUsername] = useState("");
  const [loginPassword,setLoginPassword] = useState("");
  const [createAccountUsername,setCreateAccountUsername] = useState("");
  const [createAccountEmail,setCreateAccountEmail] = useState("");
  const [createAccountPassword,setCreateAccountPassword] = useState("");
  const [confirmPassword,setConfirmPassword] = useState("");
  const [loginError,setLoginError] = useState<string|null>(null);
  const [signupError,setSignupError] = useState<string|null>(null);
  
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
        password: createAccountPassword
      }
    });
    if (error) {
      setSignupError(error);
    } else {
      redirect("/dashboard");
    }
  }
  
  return <div className={classes.root}>
    <form
      className={classes.form}
      onSubmit={(ev) => {ev.preventDefault(); logIn()}}
    >
      <div className={classes.formTitle}>Log In</div>
      <TextInput label="Username" value={loginUsername} setValue={setLoginUsername} className={classes.input}/>
      <TextInput label="Password" inputType="password" value={loginPassword} setValue={setLoginPassword} className={classes.input}/>
      <input type="submit" value="Log In" className={classes.button}/>
      {loginError && <div><ErrorMessage message={loginError}/></div>}
    </form>
    <form
      className={classes.form}
      onSubmit={(ev) => {ev.preventDefault(); createAccount()}}
    >
      <div className={classes.formTitle}>Sign Up</div>
      <TextInput label="Username" value={createAccountUsername} setValue={setCreateAccountUsername} className={classes.input}/>
      <TextInput label="Email" value={createAccountEmail} setValue={setCreateAccountEmail} className={classes.input}/>
      <TextInput label="Password" inputType="password" value={createAccountPassword} setValue={setCreateAccountPassword} className={classes.input}/>
      <TextInput label="Confirm" inputType="password" value={confirmPassword} setValue={setConfirmPassword} className={classes.input}/>
      <input type="submit" value="Create Account" className={classes.button}/>
      
      {signupError && <div><ErrorMessage message={signupError}/></div>}
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
      onSubmit={(ev) => {ev.preventDefault(); createCard()}}
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
    <form onSubmit={(ev) => {ev.preventDefault(); createDeck()}}>
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
      <TextInput label="RSS or Atom URI" value={feedUrl} setValue={setFeedUrl}/>
      <input type="submit" value="Preview"/>
      {error && <div><ErrorMessage message={error}/></div>}
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

export const components = {LoginForm,CreateCardForm,CreateDeckForm,SubscribeToFeedForm,FeedPreview};
