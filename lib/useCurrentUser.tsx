import React,{createContext,useContext} from 'react'
import {useGetApi} from './apiUtil';
import {Loading} from '../components/widgets';

const UserContext = createContext<ApiTypes.ApiObjCurrentUser|null>(null);

export function useCurrentUser() {
  return useContext(UserContext);
}

export function UserContextProvider({children}: {children: React.ReactNode}) {
  const {loading,data} = useGetApi<ApiTypes.ApiWhoami>({
    endpoint: "/api/users/whoami",
    query: {}
  });
  
  const currentUser = data?.currentUser ?? null;
  
  return <UserContext.Provider value={currentUser}>
    {loading && <Loading/>}
    {!loading && <>{children}</>}
  </UserContext.Provider>
}

