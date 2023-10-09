
/**
 * Given a list of arrays (which may be of different lengths), select a random
 * interleaving. The result is a single array containing all the input elements, with
 * elements from a shared input array in the same order relative to each other.
 */
export function randomInterleaveMany<T>(items: T[][]): T[] {
  if (!items.length) return [];
  let result = items[0];
  for (let i=1; i<items.length; i++) {
    result = randomInterleaveTwo(result, items[i]);
  }
  return result;
}

/**
 * Given two arrays (which may be of different lengths), select a random
 * interleaving. The result contains the element from both arrays, in the same
 * order relative to each other.
 */
function randomInterleaveTwo<T>(a: T[], b: T[]): T[] {
  const result: T[] = [];
  let a_index = 0;
  let b_index = 0;
  
  while(a_index < a.length || b_index < b.length) {
    const a_remaining = a.length - a_index;
    const b_remaining = b.length - b_index;
    const pr_a = a_remaining / (a_remaining + b_remaining);
    if (a_index<a.length && Math.random()<pr_a) {
      result.push(a[a_index++]);
    } else {
      result.push(b[b_index++]);
    }
  }
  
  return result;
}
