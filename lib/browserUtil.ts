
export function redirect(url: string) {
  (window as any).location = url;
}