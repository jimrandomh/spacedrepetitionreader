import React,{createContext,useContext} from 'react'
import {useGetApi} from './apiUtil';
import {Loading} from '../components/widgets';

export const UserContext = createContext<ApiTypes.ApiObjCurrentUser|null>(null);

export function useCurrentUser() {
  return useContext(UserContext);
}

