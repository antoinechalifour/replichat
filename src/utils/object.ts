export function typedFromEntries<
  T extends readonly (readonly [PropertyKey, any])[],
>(entries: T): { [K in T[number][0]]: Extract<T[number], [K, any]>[1] } {
  return Object.fromEntries(entries) as any;
}

export function typedKeys<T extends object>(obj: T): Array<keyof T> {
  return Object.keys(obj) as Array<keyof T>;
}
