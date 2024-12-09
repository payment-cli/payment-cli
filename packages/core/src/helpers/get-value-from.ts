const isFunction = (x: unknown): x is Function => typeof x === "function";

export type GetValueByName<T = string> = (name?: string) => T | Promise<T>;

export const getValueFrom = async <T, ARGS extends any[]>(
  value: T | ((...args: ARGS) => Promise<T> | T),
  args: ARGS
): Promise<T> => {
  if (isFunction(value)) {
    const resolved = await value(...args);
    return resolved;
  }

  return value;
};
