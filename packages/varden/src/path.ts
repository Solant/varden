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

export function get(target: any, path: string, defaultValue: unknown = undefined): any {
  const parts = path.split('.');

  let object = target;
  for (let i = 0; i < parts.length - 1; i += 1) {
    if (typeof object === 'object' && object !== null && parts[i]! in object) {
      object = object[parts[i]!];
    } else {
      return object[parts[i]!] ?? defaultValue;
    }
  }

  return object[parts[parts.length - 1]!];
}

export function isArrayIndex(path: string) {
  // proper implementation
  for (let index = 0; index < path.length; index += 1) {
    const code = path.charCodeAt(index);
    if (code < 48 || code > 57) {
      return false;
    }
  }

  return true;

  // lite implementation
  // charCodeAt(0) > 47 && charCodeAt(0) < 58
}

export function set(target: any, path: string, value: any) {
  const parts = path.split('.');

  let object = target;
  for (let i = 0; i < parts.length - 1; i += 1) {
    if (object[parts[i]!] == null) {
      if (isArrayIndex(parts[i + 1]!)) {
        object[parts[i]!] = [];
      } else {
        object[parts[i]!] = {};
      }
    }
    object = object[parts[i]!];
  }

  object[parts[parts.length - 1]!] = value;
}

export function del(target: any, path: string) {
  const parts = path.split('.');

  let object = target;
  for (let i = 0; i < parts.length - 1; i += 1) {
    if (typeof object === 'object' && object !== null && parts[i]! in object) {
      object = object[parts[i]!];
    } else {
      return;
    }
  }

  delete object[parts[parts.length - 1]!];
}
