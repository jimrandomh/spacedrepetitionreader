
export interface ImportedCard {
  front: string
  back: string
}

export interface ImportedDeck {
  metadata: {
    name?: string
  }
  cards: ImportedCard[]
}

export interface ImportedFile {
  decks: ImportedDeck[]
}
