
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
export function randomInterleaveTwo<T>(a: T[], b: T[]): T[] {
  let result: T[] = [];
  let a_index = 0;
  let b_index = 0;
  
  while(a_index < a.length || b_index < b.length) {
    let a_remaining = a.length - a_index;
    let b_remaining = b.length - b_index;
    let pr_a = a_remaining / (a_remaining + b_remaining);
    if (a_index<a.length && Math.random()<pr_a) {
      result.push(a[a_index++]);
    } else {
      result.push(b[b_index++]);
    }
  }
  
  return result;
}
