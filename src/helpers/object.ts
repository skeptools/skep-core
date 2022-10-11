// NB: This isn't working as expected
export function getArrayOfKeys<T>(obj: T): (keyof T)[] {
  type K = keyof T
  const result: K[] = [];
  function isKeyOfType(key: string | number | symbol): key is K {
    return (key as K) !== undefined;
  }
  for (const key in obj) {
    if (isKeyOfType(key)) result.push(key);
  }
  return result;
}

export function extract<T, A extends T>(obj: A): T {
  let result = {} as T;
  getArrayOfKeys<T>(obj as T).forEach(key => {
    // stupid hack below, just to remove integrations property
    if (key !== 'integrations') result[key] = obj[key];
  });
  return result;
}

export function overRecord<K extends string | number | symbol, T>(record: Record<K, T>, f: (value: T, key: K) => void): void {
  getArrayOfKeys(record).forEach(key => {
    f(record[key], key);
  });
}
export function mapRecord<M, K extends string | number | symbol, T>(record: Record<K, T>, f: (value: T, key: K) => M | undefined): Record<K, M> {
  return getArrayOfKeys(record).reduce((previous, key) => {
    const mappedValue = f(record[key], key);
    if (mappedValue !== undefined) previous[key] = mappedValue;
    return previous;
  }, {} as Record<K, M>);
}

export function getRecordKeyValues<K extends string | number | symbol, T>(record: Record<K, T>): [K, T][] {
  const result: [K, T][] = [];
  for (const key in record) result.push([key, record[key]]);
  return result;
}

export function getRecordValues<K extends string | number | symbol, T>(record: Record<K, T>): T[] {
  const result: T[] = [];
  for (const key in record) result.push(record[key]);
  return result;
}
