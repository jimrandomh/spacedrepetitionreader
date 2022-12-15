import React, {useState} from 'react'
import {doPost} from '../lib/apiUtil';
import {TextAreaInput} from './TextAreaInput';
import {ErrorMessage} from './ErrorMessage';
import {redirect} from '../lib/browserUtil';

export function CreateCardForm({deck}: {
  deck: ApiTypes.ApiObjDeck
}) {
  const [cardFront,setCardFront] = useState("");
  const [cardBack,setCardBack] = useState("");
  const [error,setError] = useState<string|null>(null);
  
  async function createCard() {
    const {result,error} = await doPost<ApiTypes.ApiCreateCard>({
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
    <form onSubmit={(ev) => {ev.preventDefault(); createCard()}}>
      <TextAreaInput label="Front" value={cardFront} setValue={setCardFront}/>
      <TextAreaInput label="Back" value={cardBack} setValue={setCardBack}/>
      <input type="submit" value="Create Card"/>
      
      {error && <ErrorMessage message={error}/>}
    </form>
  </div>;
}
