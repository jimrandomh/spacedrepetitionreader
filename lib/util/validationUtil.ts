
export function filterKeys<T extends object>(obj: Partial<T>, defaults: T): Partial<T> {
  const result: Partial<T> = {};

  for (const key of Object.keys(defaults)) {
    if (key in obj) {
      const typedKey = key as keyof T;
      result[typedKey] = obj[typedKey] as any;
    }
  }
  
  return result;
}
