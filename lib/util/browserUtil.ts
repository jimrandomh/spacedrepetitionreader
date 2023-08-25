
declare global {
  let isClient: boolean;
  let isServer: boolean;
}

export function redirect(url: string) {
  // TODO handle SSR
  if(isClient) {
    (window as any).location = url;
  }
}