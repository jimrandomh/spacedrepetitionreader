
/// Given an array of functions returning promises and a maximum parallelism,
/// call all of the functions provided and wait for them to finish. Ensure that
/// at most the specified number of promises are outstanding at a time, and that
/// the resolutions of the promises are returned in the correct slots.
export async function awaitAll<T>(asyncFns: (() => Promise<T>)[], maxConcurrent: number): Promise<T[]> {
  const results: T[] = [];
  while (asyncFns.length > 0) {
    const concurrentFns = asyncFns.splice(0, maxConcurrent);
    const chunkResults = await Promise.all(concurrentFns.map(fn => fn()));
    results.push(...chunkResults);
  }
  return results;
}

export function sleep(delayMs: number): Promise<void> {
  return new Promise<void>(accept => {
    setTimeout(accept, delayMs);
  });
}
