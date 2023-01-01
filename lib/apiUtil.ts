import {useCallback} from 'react';
import {createContext,useContext,useSyncExternalStore} from 'react';
import Route from 'route-parser';
import mapValues from 'lodash/mapValues';

type ApiQueryStatus = {
  result: {loading: boolean, result: any}
  subscribers: Set<any>
}
export class GetApiProvider {
  fetch: (uri: string)=>Promise<any>
  queries: Record<string,ApiQueryStatus>
  
  constructor(fetch: (url: string)=>Promise<any>) {
    this.fetch = fetch;
    this.queries = {};
  }
  
  subscribe(uri: string) {
    this._createRequest(uri);
    
    return (callback: ()=>void) => {
      this.queries[uri].subscribers.add(callback);
      
      return () => {
        this.queries[uri].subscribers.delete(callback);
      }
    }
  }
  getSnapshot(uri: string) {
    this._createRequest(uri);
    
    return () => {
      const result = this.queries[uri].result;
      return result;
    }
  }
  
  isAnyPending() {
    for (const uri of Object.keys(this.queries)) {
      if(this.queries[uri].result.loading)
        return true;
    }
    return false;
  }
  
  getCacheSize(): number {
    return Object.keys(this.queries).length;
  }
  
  addToCache(cacheEntries: Record<string,any>) {
    for(const uri of Object.keys(cacheEntries)) {
      this.queries[uri] = {
        result: {loading:false, result: cacheEntries[uri]},
        subscribers: new Set()
      };
    }
  }
  
  refetch(_uri: string) {
    //TODO
  }
  
  _createRequest(uri: string) {
    if(!(uri in this.queries)) {
      const queryStatus = {
        result: {loading: true, result: null},
        subscribers: new Set<any>(),
      };
      this.queries[uri] = queryStatus;
      void (async () => {
        const fetchResult = await this.fetch(uri);
        queryStatus.result = {
          loading: false,
          result: fetchResult,
        }
        this._notifySubscribers(queryStatus);
      })();
    }
  }
  
  _notifySubscribers(queryStatus: ApiQueryStatus) {
    const {result, subscribers} = queryStatus;
    for(const subscriber of subscribers) {
      subscriber(result);
    }
  }
}
export const GetApiContext = createContext<GetApiProvider|null>(null);


export function useGetApi<
  T extends ApiTypes.RestApiGet,
>({ endpoint, query, skip }: {
  endpoint: T["path"],
  query: T["queryArgs"],
  skip?: boolean,
}): {
  loading: boolean
  data: T["responseType"]|null
  refetch: ()=>void
} {
  const apiProvider = useContext(GetApiContext);
  if (!apiProvider) throw new Error("No API provider");
  
  /*if (skip) {
    return {loading: false, data: null, refetch: noOpFunction};
  }*/
  
  const withArgs = new Route(endpoint).reverse(mapValues(query, (v:any)=>encodeURIComponent(v)));
  if (!withArgs) throw new Error("Route-parsing failed");
  
  const {loading,result} = useSyncExternalStore(
    apiProvider.subscribe(withArgs),   //subscribe
    apiProvider.getSnapshot(withArgs), //getSnapshot
    apiProvider.getSnapshot(withArgs), //getSnapshot
  );
  
  const refetch = useCallback(() => {
    apiProvider.refetch(withArgs);
  }, [apiProvider,withArgs]);
  
  return {loading, data:result, refetch};
}

export async function doPost<T extends ApiTypes.RestApiPost>({ endpoint, query, body }: {
  endpoint: T["path"],
  query: T["queryArgs"],
  body: T["bodyArgs"],
}): Promise<
  {result: T["responseType"], error:null}
  |{result:null, error: string}
> {
  const withArgs = new Route(endpoint).reverse(mapValues(query, (v:any)=>encodeURIComponent(v)));
  if (!withArgs) throw new Error("Route-parsing failed");
  console.log("POST with body "+JSON.stringify(body));
  const fetchResult = await fetch(withArgs, {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
    },
  });
  
  if(!fetchResult.ok) {
    return {
      result: null,
      error: (await fetchResult.json()).error,
    };
  }
  
  const responseBody = await fetchResult.json();
  return {
    result: responseBody,
    error: null
  };
}

