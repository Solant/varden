export type Paths<T> = T extends Array<infer U>
  ? `${number}.${Paths<U>}`
  : T extends object
    ? {
      [K in keyof T & (string | number)]: K extends string ? `${K}` | `${K}.${Paths<T[K]>}` : never;
    }[keyof T & (string | number)]
    : never;

export type ArrayPaths<T> = T extends Array<infer U>
  ? (U extends Array<unknown> ? `${number}` : never) | `${number}.${ArrayPaths<U>}`
  : T extends object
    ? {
      [K in keyof T & (string | number)]: K extends string
        ? T[K] extends Array<unknown>
          ? `${K}` | `${K}.${ArrayPaths<T[K]>}`
          : `${K}.${ArrayPaths<T[K]>}`
        : never;
    }[keyof T & (string | number)]
    : never;

export type Get<T, P extends Paths<T>> = P extends `${infer K}.${infer R}`
  ? K extends keyof T
    ? R extends Paths<T[K]>
      ? Get<T[K], R>
      : never
    : never
  : P extends keyof T
    ? T[P]
    : never;

type _GetArray<T, P extends ArrayPaths<T>> = P extends `${infer K}.${infer R}`
  ? K extends keyof T
    ? R extends Paths<T[K]>
      ? Get<T[K], R>
      : never
    : never
  : P extends keyof T
    ? T[P]
    : never;

// Specialized Get for ArrayPaths as a workaround for tsc stack overflow error
export type GetArray<T, P extends ArrayPaths<T>> = _GetArray<T, P> extends Array<infer R>
  ? R
  : never;

export type CompiledPath = Array<string | number>;

export function toCompiledPath(path: string): CompiledPath {
  const parts: CompiledPath = path.split('.');
  for (let i = 0; i < parts.length; i += 1) {
    if (isArrayIndex(parts[i] as string)) {
      parts[i] = Number.parseInt(parts[i] as string, 10);
    }
  }

  return parts;
}

export const Empty = Symbol('empty');

export function get(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  target: any,
  path: CompiledPath,
  defaultValue: unknown = undefined,
  maxDepth: number = Infinity,
// eslint-disable-next-line @typescript-eslint/no-explicit-any
): any {
  const limit = Math.min(path.length - 1, maxDepth);
  let object = target;
  for (let i = 0; i < limit; i += 1) {
    if (typeof object === 'object' && object !== null && path[i]! in object) {
      object = object[path[i]!];
    } else {
      // target path is longer than the object, return defaultValue
      return object?.[path[i]!] ?? defaultValue;
    }
  }

  // early return for null/undefined objects
  if (!object) return defaultValue;
  return path[limit]! in object ? object[path[limit]!] : defaultValue;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isEmptyObject(obj: any): boolean {
  // eslint-disable-next-line no-unreachable-loop, guard-for-in, no-restricted-syntax
  for (const _ in obj) {
    return false;
  }

  return true;
}

export function isArrayIndex(path: string) {
  for (let index = 0; index < path.length; index += 1) {
    const code = path.charCodeAt(index);
    if (code < 48 || code > 57) {
      return false;
    }
  }

  return true;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function set(target: any, path: CompiledPath, value: any) {
  let object = target;
  for (let i = 0; i < path.length - 1; i += 1) {
    if (object[path[i]!] == null) {
      if (typeof path[i + 1] === 'number') {
        object[path[i]!] = [];
      } else {
        object[path[i]!] = {};
      }
    }
    object = object[path[i]!];
  }

  object[path[path.length - 1]!] = value;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function del(target: any, path: CompiledPath, maxDepth: number = Infinity) {
  const limit = Math.min(path.length - 1, maxDepth);
  let object = target;
  for (let i = 0; i < limit; i += 1) {
    if (typeof object === 'object' && object !== null && path[i]! in object) {
      object = object[path[i]!];
    } else {
      return;
    }
  }

  delete object[path[limit]!];
}
