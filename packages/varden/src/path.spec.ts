import { expect, it, describe } from 'vitest';
import { del, get, isArrayIndex } from './path.ts';

describe('path utilities', () => {
  it('should detect array index', () => {
    expect(isArrayIndex('123')).toBe(true);
    expect(isArrayIndex('0')).toBe(true);
    expect(isArrayIndex('9')).toBe(true);
  });

  it('should omit field with leading number', () => {
    expect(isArrayIndex('123test')).toBe(false);
  });

  it('should return value by path', () => {
    expect(get({ foo: { bar: 2 } }, 'foo.bar')).toBe(2);
  });

  it('should return undefined value for unknown path', () => {
    expect(get({ foo: { bar: 2 } }, 'foo.bar.baz.qwe.asd')).toBe(undefined);
  });

  it('should return default value for unknown path', () => {
    expect(get({ foo: { bar: 2 } }, 'foo.bar.baz.qwe.asd', 'TEST')).toBe('TEST');
  });

  it('should return actual nullish value instead of default', () => {
    expect(get({ foo: { bar: null } }, 'foo.bar', 'TEST')).toBe(null);
    expect(get({ foo: { bar: undefined } }, 'foo.bar', 'TEST')).toBe(undefined);
    expect(get({ foo: { bar: 0 } }, 'foo.bar', 'TEST')).toBe(0);
    expect(get({ foo: { bar: '' } }, 'foo.bar', 'TEST')).toBe('');
  });

  it('should delete value by path', () => {
    const value = { foo: { bar: 2, baz: 3 } };
    del(value, 'foo.bar');
    expect(value).toEqual({ foo: { baz: 3 } });

    const value2 = { foo: { bar: { baz: 3 }, zab: 4 } };
    del(value2, 'foo.bar');
    expect(value2).toEqual({ foo: { zab: 4 } });
  });
});
