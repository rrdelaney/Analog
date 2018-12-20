export function flat<T>(acc: T[], curr: T[]): T[] {
  return [...acc, ...curr];
}

export function toObject(
  obj: Record<string, string>,
  key: string
): Record<string, string> {
  return {
    ...obj,
    [key]: key
  };
}
