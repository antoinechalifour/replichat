export async function promiseAllObject<T extends Record<string, Promise<any>>>(
  obj: T,
): Promise<{ [K in keyof T]: Awaited<T[K]> }> {
  const keys = Object.keys(obj) as (keyof T)[];
  const values = await Promise.all(keys.map((key) => obj[key]));
  const result = {} as { [K in keyof T]: Awaited<T[K]> };

  keys.forEach((key, index) => {
    result[key] = values[index];
  });

  return result;
}
