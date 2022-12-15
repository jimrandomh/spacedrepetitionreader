import React, {useState} from 'react'
import {doPost} from '../lib/apiUtil';
import {TextInput} from './TextInput';
import {redirect} from '../lib/browserUtil';
import type {ApiCreateDeck} from '../lib/apiTypes';

export function CreateDeckForm() {
  const [deckName,setDeckName] = useState("");
  const [error,setError] = useState<string|null>(null);
  
  async function createDeck() {
    const {result,error} = await doPost<ApiCreateDeck>({
      endpoint: "/api/decks/create",
      query: {},
      body: {
        name: deckName
      }
    });
    if(error) {
      setError(error);
    } else {
      redirect(`/decks/edit/${result!.id}`);
    }
  }
  
  return <div>
    <form onSubmit={(ev) => {ev.preventDefault(); createDeck()}}>
      <TextInput label="Name" value={deckName} setValue={setDeckName}/>
      <input type="submit" value="Create Deck"/>
    </form>
  </div>;
}
