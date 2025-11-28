export type Paths<T> =
  T extends Array<infer U>
    ? `${Paths<U>}`
    : T extends object
      ? {
          [K in keyof T & (string | number)]: K extends string ? `${K}` | `${K}.${Paths<T[K]>}` : never;
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

type CompiledPath = Array<string | number>;

export function toCompiledPath(path: string): CompiledPath {
  const parts: CompiledPath = path.split('.')
  for (let i = 0; i < parts.length; i += 1) {
    if (isArrayIndex(parts[i] as string)) {
      parts[i] = Number.parseInt(parts[i] as string, 10);
    }
  }

  return parts;
}

export function get(target: any, path: CompiledPath, defaultValue: unknown = undefined): any {
  let object = target;
  for (let i = 0; i < path.length - 1; i += 1) {
    if (typeof object === 'object' && object !== null && path[i]! in object) {
      object = object[path[i]!];
    } else {
      return object[path[i]!] ?? defaultValue;
    }
  }

  return object[path[path.length - 1]!];
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

export function del(target: any, path: CompiledPath) {
  let object = target;
  for (let i = 0; i < path.length - 1; i += 1) {
    if (typeof object === 'object' && object !== null && path[i]! in object) {
      object = object[path[i]!];
    } else {
      return;
    }
  }

  delete object[path[path.length - 1]!];
}
