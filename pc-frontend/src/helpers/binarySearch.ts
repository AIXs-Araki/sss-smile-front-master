export const findFirstIndex = <T>(
  array: T[],
  predicate: (item: T) => boolean
): number => {
  let left = 0;
  let right = array.length - 1;
  let result = -1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (predicate(array[mid])) {
      result = mid;
      right = mid - 1;
    } else {
      left = mid + 1;
    }
  }

  return result;
};

export const findLastIndex = <T>(
  array: T[],
  predicate: (item: T) => boolean
): number => {
  let left = 0;
  let right = array.length - 1;
  let result = -1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (predicate(array[mid])) {
      result = mid;
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  return result;
};