
export function simpleTruncateStr(str: string, len: number): string {
  if (str.length > len) {
    return str.substring(0,len) + "...";
  } else {
    return str;
  }
}