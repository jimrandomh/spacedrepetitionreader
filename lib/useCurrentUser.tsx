import {createContext,useContext} from 'react'

export const UserContext = createContext<ApiTypes.ApiObjCurrentUser|null>(null);

export function useCurrentUser() {
  return useContext(UserContext);
}

