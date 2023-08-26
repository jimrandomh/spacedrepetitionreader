import { User } from "@prisma/client";

export interface UserOptions {
  enableCardsDueEmails: boolean
  timezone: string
  cardsBecomeDueAt: number
}
export const defaultUserOptions: UserOptions = {
  enableCardsDueEmails: true,
  timezone: "America/Los_Angeles",
  cardsBecomeDueAt: 3.5,
};

export function getUserOptions(user: User|ApiTypes.ApiObjCurrentUser|null): UserOptions {
  if (!user) {
    return defaultUserOptions;
  }
  return {
    ...defaultUserOptions,
    ...(user.config as Partial<UserOptions>)
  }
}

export function validateUserOptions(config: Partial<UserOptions>): Partial<UserOptions> {
  const result: Partial<UserOptions> = {};

  for (const key of Object.keys(defaultUserOptions)) {
    if (key in config) {
      const typedKey = key as keyof UserOptions;
      result[typedKey] = config[typedKey] as any;
    }
  }
  
  if ("enableCardsDueEmails" in result && typeof result.enableCardsDueEmails!=='boolean') {
    delete result.enableCardsDueEmails;
  }
  if ("timezone" in result && typeof result.timezone!=='string') {
    delete result.timezone;
  }
  if ("cardsBecomeDueAt" in result && (
    typeof result.cardsBecomeDueAt!=='number'
    || result.cardsBecomeDueAt<0
    || result.cardsBecomeDueAt>=24
  )) {
    delete result.cardsBecomeDueAt;
  }
  
  return result;
}

export function formatTimeInHours(hours: number): string {
  if (hours<0) {
    return "-"+formatTimeInHours(-hours);
  }
  const intHours = Math.floor(hours);
  const mins = Math.round(60 * (hours - intHours));
  return padNumberToWidth(intHours, 2)+":"+padNumberToWidth(mins, 2);
}

function padNumberToWidth(n: number, width: number) {
  const s: string = ""+n;
  const paddingChars = width - s.length;
  if (paddingChars >= 0) {
    let padding: string = "";
    for (let i=0; i<paddingChars; i++)
      padding += '0';
    return padding+s;
  } else {
    return s;
  }
}
