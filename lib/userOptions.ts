import { User } from "@prisma/client";

export interface UserOptions {
  enableCardsDueEmails: boolean
}
export const defaultUserOptions: UserOptions = {
  enableCardsDueEmails: true
};

export function getUserOptions(user: User): UserOptions {
  return {
    ...defaultUserOptions,
    ...(user.config as Partial<UserOptions>)
  }
}
