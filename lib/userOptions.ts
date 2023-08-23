import { User } from "@prisma/client";

export interface UserOptions {
  enableCardsDueEmails: boolean
}
export const defaultUserOptions: UserOptions = {
  enableCardsDueEmails: true
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
      result[typedKey] = config[typedKey];
    }
  }
  
  if ("enableCardsDueEmails" in result && typeof result.enableCardsDueEmails!=='boolean') {
    delete result.enableCardsDueEmails;
  }
  
  return result;
}
