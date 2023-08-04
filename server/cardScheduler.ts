import type {ServerApiContext} from './serverApiUtil';
import type {Card,CardImpression} from '@prisma/client'
import orderBy from 'lodash/orderBy';

export function getDueDate(card: Card, pastImpressions: CardImpression[], _ctx: ServerApiContext): Date {
  // If a card has no impressions, it's due
  if (!pastImpressions.length) {
    return card.createdAt;
  }
  
  // TODO PLACEHOLDER: A card is due a fixed duration after its last impression depending on the result
  const sortedImpressions = orderBy(pastImpressions, imp=>imp.date);
  const lastImpression = sortedImpressions[sortedImpressions.length-1];
  const lastImpressionTime = lastImpression.date.getTime();

  // TODO: algorithm below is part of the algorithm from here, not including review mode subtleties: https://docs.ankiweb.net/studying.html
  const steps = [0, 10, 60*24, 60*24*3, 60*24*6, 60*24*12, 60*24*24, 60*24*48];

  let currentStepIndex = 0;
  for(const impression of sortedImpressions) {
    switch(impression.resolution) {
      case "Easy":
        currentStepIndex = Math.min(currentStepIndex+1, steps.length-1);
        break;
      case "Hard":
        break;
      case "Repeat":
        currentStepIndex = 0;
        break;
    }
  }

  return new Date(lastImpressionTime + steps[currentStepIndex] * 60*1000);
}

