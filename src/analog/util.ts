export function flat<T>(acc: T[], curr: T[]): T[] {
  return [...acc, ...curr];
}

export function randomId() {
  return Math.random()
    .toString(36)
    .substring(7);
}
