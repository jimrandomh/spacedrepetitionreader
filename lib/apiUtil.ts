import {useState,useCallback,useEffect} from 'react';
import Route from 'route-parser';
import mapValues from 'lodash/mapValues';

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
  const [result,setResult] = useState<{loading:boolean, data: T["responseType"]|null}>({loading:true, data:null});
  
  const refetch = useCallback(async () => {
    const withArgs = new Route(endpoint).reverse(mapValues(query, (v:any)=>encodeURIComponent(v)));
    if (!withArgs) throw new Error("Route-parsing failed");
    
    const fetchResult = await fetch(withArgs, {
      method: "GET",
    });
    const body = await fetchResult.json();
    setResult({
      loading: false,
      data: body
    });
  //Deliberately not including 'query' as a dependency here because it's too
  //prone to referential stability issues
  //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint]);
  
  useEffect(() => {
    if (!skip) {
      refetch();
    }
  }, [skip,refetch]);
  
  return {...result,refetch};
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
