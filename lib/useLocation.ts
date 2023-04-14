import {createContext,useContext} from 'react'

const LocationContext = createContext<string|null>(null);

export function useLocation(): {url: string, query: URLSearchParams} {
  const context = useContext(LocationContext);
  if(!context) throw new Error("useLocation must be used within a LocationContextProvider");
  const parsedURL = new URL(context, "http://localhost");
  
  return {
    url: context,
    query: new URLSearchParams(parsedURL.search),
  };
}

export const LocationContextProvider = LocationContext.Provider;