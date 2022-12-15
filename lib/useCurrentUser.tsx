import React,{createContext,useContext} from 'react'
import {useGetApi} from './apiUtil';
import type {ApiObjCurrentUser,ApiWhoami} from './apiTypes';

const UserContext = createContext<ApiObjCurrentUser|null>(null);

export function useCurrentUser() {
  return useContext(UserContext);
}

export function UserContextProvider({children}: {children: React.ReactNode}) {
  const {loading,data} = useGetApi<ApiWhoami>({
    endpoint: "/api/users/whoami",
    query: {}
  });
  
  const currentUser = data?.currentUser ?? null;
  
  return <UserContext.Provider value={currentUser}>
    {children}
  </UserContext.Provider>
}

