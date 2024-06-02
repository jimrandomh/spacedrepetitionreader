import { useCallback, useSyncExternalStore } from 'react';
import Route from 'route-parser';
import mapValues from 'lodash/mapValues';
import { useRenderContext } from './renderContext';

type ApiQueryStatus = {
  result: {loading: boolean, refetching: boolean, result: any, error: any}
  subscribers: Set<any>
}
export class GetApiProvider {
  fetch: (uri: string)=>Promise<any>
  queries: Record<string,ApiQueryStatus>
  numPending: number
  genericWatches: Set<()=>void>
  
  constructor(fetch: (url: string)=>Promise<any>) {
    this.fetch = fetch;
    this.queries = {};
    this.numPending = 0;
    this.genericWatches = new Set<()=>void>();
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
    return this.numPending > 0;
  }
  
  getCacheSize(): number {
    return Object.keys(this.queries).length;
  }
  
  addToCache(cacheEntries: Record<string,any>) {
    for(const uri of Object.keys(cacheEntries)) {
      this.queries[uri] = {
        result: {loading:false, refetching: false, result: cacheEntries[uri], error: null},
        subscribers: new Set()
      };
    }
  }
  
  refetch(uri: string) {
    const existingQueryStatus = this.queries[uri];
    if (!existingQueryStatus) throw new Error("Refetching a query that hasn't been fetched");

    const queryStatus = {
      ...this.queries[uri],
      result: {
        ...this.queries[uri].result,
        refetching: true,
      },
    };
    this.queries[uri] = queryStatus;
    void (async () => {
      try {
        this.numPending++;
        const fetchResult = await this.fetch(uri);
        queryStatus.result = {
          loading: false,
          refetching: false,
          result: fetchResult,
          error: null,
        }
      } catch(e) {
        queryStatus.result = {
          loading: false,
          refetching: false,
          result: null,
          error: e,
        };
      } finally {
        this.numPending--;
      }
      this._notifySubscribers(queryStatus);
    })();
  }
  
  _createRequest(uri: string) {
    if(!(uri in this.queries)) {
      const queryStatus = {
        result: {loading: true, refetching: false, result: null, error: null},
        subscribers: new Set<any>(),
      };
      this.queries[uri] = queryStatus;
      void (async () => {
        try {
          this.numPending++;
          const fetchResult = await this.fetch(uri);
          queryStatus.result = {
            loading: false,
            refetching: false,
            result: fetchResult,
            error: null,
          }
        } catch(e) {
          queryStatus.result = {
            loading: false,
            refetching: false,
            result: null,
            error: e,
          };
        } finally {
          this.numPending--;
        }
        this._notifySubscribers(queryStatus);
      })();
    }
  }
  
  _notifySubscribers(queryStatus: ApiQueryStatus) {
    const {result, subscribers} = queryStatus;
    for(const subscriber of [...subscribers.values()]) {
      subscriber(result);
    }
    for (const subscriber of [...this.genericWatches]) {
      subscriber();
    }
  }
  
  waitUntilProgress(): Promise<void> {
    return new Promise((resolve) => {
      const callback = () => {
        this.genericWatches.delete(callback);
        resolve();
      }
      this.genericWatches.add(callback);
    });
  }

  async waitUntilFinished(): Promise<void> {
    while(this.isAnyPending()) {
      await this.waitUntilProgress();
    }
  }
}

export function useGetApi<
  T extends ApiTypes.RestApiGet,
>({ endpoint, query, searchParams }: {
  endpoint: T["path"],
  query: T["queryArgs"],
  searchParams?: URLSearchParams,
}): {
  loading: boolean
  data: T["responseType"]|null
  refetch: ()=>void
} {
  const { apiProvider } = useRenderContext();
  if (!apiProvider) throw new Error("No API provider");
  
  // TODO: Add a skip option
  /*if (skip) {
    return {loading: false, data: null, refetch: noOpFunction};
  }*/
  
  const withArgs = new Route(endpoint).reverse(mapValues(query, (v:any)=>encodeURIComponent(v)));
  if (!withArgs) throw new Error("Route-parsing failed");
  
  const withSearchParams = searchParams ? withArgs+"?"+searchParams.toString() : withArgs;

  const {loading,result} = useSyncExternalStore(
    apiProvider.subscribe(withSearchParams),   //subscribe
    apiProvider.getSnapshot(withSearchParams), //getSnapshot
    apiProvider.getSnapshot(withSearchParams), //getSnapshot
  );
  
  const refetch = useCallback(() => {
    return apiProvider.refetch(withSearchParams);
  }, [apiProvider,withSearchParams]);
  
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
  //console.log("POST with body "+JSON.stringify(body));
  const fetchResult = await fetch(withArgs, {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
    },
  });
  
  if(!fetchResult.ok) {
    const errorFromBody = (await fetchResult.json()).error;
    return {
      result: null,
      error: errorFromBody ?? fetchResult.statusText,
    };
  }
  
  const responseBody = await fetchResult.json();
  return {
    result: responseBody,
    error: null
  };
}

