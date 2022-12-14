import {useState,useCallback,useEffect,useMemo} from 'react';
import type {RestApi} from './apiTypes';
import Route from 'route-parser';

export function useGetApi<
  T extends RestApi,
>({ endpoint, query, body }: {
  endpoint: T["path"],
  query: T["queryArgs"],
  body: T["bodyArgs"],
}): {
  loading: boolean
  data: T["responseType"]|null
  refetch: ()=>void
} {
  const [result,setResult] = useState<{loading:boolean, data: T["responseType"]|null}>({loading:true, data:null});
  
  const refetch = useCallback(async () => {
    const withArgs = new Route(endpoint).reverse(query);
    if (!withArgs) throw new Error("Route-parsing failed");
    const fetchResult = await fetch(withArgs, {
      method: "GET",
      body: JSON.stringify(body),
    });
    setResult({
      loading: false,
      data: fetchResult.json(),
    });
  }, []);
  
  useEffect(() => {
    refetch();
  }, [refetch]);
  
  return {...result,refetch};
}
