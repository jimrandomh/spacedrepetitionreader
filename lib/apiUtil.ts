import {useState,useCallback,useEffect,useMemo} from 'react';
import type {RestApiGet,RestApiPost} from './apiTypes';
import Route from 'route-parser';
import mapValues from 'lodash/mapValues';

export function useGetApi<
  T extends RestApiGet,
>({ endpoint, query, skip }: {
  endpoint: T["path"],
  query: T["queryArgs"],
  skip?: boolean,
}): {
  loading: boolean
  data: T["responseType"]|null
  refetch: ()=>void
} {
  const [result,setResult] = useState<{loading:boolean, data: T["responseType"]|null}>({loading:true, data:null});
  
  const refetch = useCallback(async () => {
    const withArgs = new Route(endpoint).reverse(mapValues(query, (v:any)=>encodeURIComponent(v)));
    if (!withArgs) throw new Error("Route-parsing failed");
    const fetchResult = await fetch(withArgs, {
      method: "GET",
      //body: JSON.stringify(body),
    });
    const body = await fetchResult.json();
    console.log(endpoint);
    console.log(body);
    setResult({
      loading: false,
      data: body
    });
  }, []);
  
  useEffect(() => {
    if (!skip) {
      refetch();
    }
  }, [skip,refetch]);
  
  return {...result,refetch};
}

export async function doPost<T extends RestApiPost>({ endpoint, query, body }: {
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
  const responseBody = await fetchResult.json();
  return {
    result: responseBody,
    error: null
  };
}
