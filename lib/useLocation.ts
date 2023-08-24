import {createContext,useContext} from 'react'
import { Endpoint } from './routes';

export interface ParsedLocation {
  url: string
  route: Endpoint|null
  routeProps: object
}

const LocationContext = createContext<ParsedLocation|null>(null);

export function useLocation(): {url: string, query: URLSearchParams} {
  const context = useContext(LocationContext);
  if(!context) throw new Error("useLocation must be used within a LocationContextProvider");

  const url = context.url;
  const parsedURL = new URL(url, "http://localhost");
  
  return {
    url,
    query: new URLSearchParams(parsedURL.search),
  };
}

export const LocationContextProvider = LocationContext.Provider;
