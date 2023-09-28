
/*
 * TODO
 * This is the outline of an API interface for pluggable scheduling algorithms.
 * But, it isn't wired up.
 */

/**
 * Card scheduler base class. Extend to implement different scheduling
 * algorithms. To define a scheduling algorithm, extend this and implement all
 * the abstract methods.
 *
 * `SchedulerOptions` should be a JSON-serializable type that represents the
 * different knobs that the scheduling algorithm has. `getDefaultOptions`
 * returns the default config.
 *
 * `CardState` represents the state of a single card (eg whether it's active,
 * when it was last reviewed, which bucket it's in.) Must be JSON-serializable.
 * The initial state (for newly added cards) is returned by
 * `getInitialCardState`.
 *
 * `DeckState` represents the state of a *deck*. Must be JSON-serializable. The
 * initial state is returned by `getInitialDeckState`.
 *
 * Note that `Date` is not a JSON-serializable type. Instead of dates, use ISO
 * date strings (eg "2023-01-01T01:00:00.000Z").
 */
abstract class Scheduler<SchedulerOptions,CardState,DeckState> {
  abstract getDefaultOptions(): SchedulerOptions;
  abstract getInitialCardState(): CardState;
  abstract getInitialDeckState(): DeckState;

  /**
   * Get the date when this deck is next due for review. (If due-dates are
   * per-card, this is the earliest card due date.)
   */
  abstract getDeckDueDate(args: GetDeckDueDateParameters<SchedulerOptions,CardState,DeckState>): Date;

  /**
   * Get the cards to be reviewed, in review-order, assuming a review starts now
   */
  abstract getCardsForReview(args: GetCardsForReviewParameters<SchedulerOptions,CardState,DeckState>): ApiTypes.ApiObjCard[];

  /**
   * Get the updated state of a card, after that card has been reviewed and had
   * a review result (eg Easy, Hard, Repeat)
   */
  abstract getCardStateAfterImpression(args: GetCardStateAfterImpressionParameters<SchedulerOptions,CardState,DeckState>): CardState;
}

interface GetDeckDueDateParameters<SchedulerOptions,CardState,DeckState> {
  schedulerOptions: SchedulerOptions,
  cards: ApiTypes.ApiObjCard[],
  cardStates: CardState[],
  deck: ApiTypes.ApiObjDeck,
  deckState: DeckState,
}
interface GetCardsForReviewParameters<SchedulerOptions,CardState,DeckState> {
  schedulerOptions: SchedulerOptions,
  cards: ApiTypes.ApiObjCard[],
  cardStates: CardState[],
  deck: ApiTypes.ApiObjDeck,
  deckState: DeckState,
  forceAddMoreCards: boolean
}
interface GetCardStateAfterImpressionParameters<SchedulerOptions,CardState,DeckState> {
  schedulerOptions: SchedulerOptions,
  card: ApiTypes.ApiObjCard,
  cardState: CardState,
  deck: ApiTypes.ApiObjDeck,
  deckState: DeckState,
}

//////////////////////////////////////////////////////////////////////////////

interface DefaultSchedulerOptions {
  maxNewCardsPerReview: number
}
interface DefaultSchedulerCardState {
  active: boolean
  lastReviewedAt: string|null
  bucket: number
}
interface DefaultSchedulerDeckState {
}

export class DefaultScheduler extends Scheduler<DefaultSchedulerOptions,DefaultSchedulerCardState,DefaultSchedulerDeckState> {
  override getDefaultOptions(): DefaultSchedulerOptions {
    return {
      maxNewCardsPerReview: 20,
    };
  }
  override getInitialCardState(): DefaultSchedulerCardState {
    return {
      active: false,
      lastReviewedAt: null,
      bucket: 0,
    };
  }
  override getInitialDeckState(): DefaultSchedulerDeckState {
    return {}; //TODO
  }

  override getDeckDueDate(_args: GetDeckDueDateParameters<DefaultSchedulerOptions,DefaultSchedulerCardState,DefaultSchedulerDeckState>): Date {
    return new Date(); // TODO
  }

  /**
   * Get the cards to be reviewed, in review-order, assuming a review starts now
   */
  override getCardsForReview(_args: GetCardsForReviewParameters<DefaultSchedulerOptions,DefaultSchedulerCardState,DefaultSchedulerDeckState>): ApiTypes.ApiObjCard[] {
    return []; // TODO
  }

  /**
   * Get the updated state of a card, after that card has been reviewed and had
   * a review result (eg Easy, Hard, Repeat)
   */
  override getCardStateAfterImpression(args: GetCardStateAfterImpressionParameters<DefaultSchedulerOptions,DefaultSchedulerCardState,DefaultSchedulerDeckState>): DefaultSchedulerCardState {
    return {
      active: true,
      lastReviewedAt: new Date().toISOString(),
      bucket: args.cardState.bucket, //TODO
    };
  }
}

