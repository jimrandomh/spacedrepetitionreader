import type {ServerApiContext} from './serverApiUtil';
import type {Card,CardImpression} from '@prisma/client'
import orderBy from 'lodash/orderBy';

export function getDueDate(card: Card, pastImpressions: CardImpression[], ctx: ServerApiContext): Date {
  // If a card has no impressions, it's due
  if (!pastImpressions.length) {
    return card.createdAt;
  }
  
  // TODO PLACEHOLDER: A card is due a fixed duration after its last impression depending on the result
  const sortedImpressions = orderBy(pastImpressions, imp=>imp.date);
  const lastImpression = sortedImpressions[sortedImpressions.length-1];
  const lastImpressionTime = lastImpression.date.getTime();
  const now = new Date().getTime();
  
  switch (lastImpression.resolution) {
    default:
    case "Easy":
      return new Date(lastImpressionTime + 60*60*1000); //1hr
    case "Hard":
      return new Date(lastImpressionTime + 5*60*1000); //5min
    case "Repeat":
      return new Date(lastImpressionTime + 5*1000); //5s
  }
}

