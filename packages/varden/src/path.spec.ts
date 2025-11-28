import { expect, it, describe } from 'vitest';

import { del, get, isArrayIndex, set, toCompiledPath } from './path';

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
    expect(get({ foo: { bar: 2 } }, toCompiledPath('foo.bar'))).toBe(2);
  });

  it('should return undefined value for unknown path', () => {
    expect(get({ foo: { bar: 2 } }, toCompiledPath('foo.bar.baz.qwe.asd'))).toBe(undefined);
  });

  it('should return default value for unknown path', () => {
    expect(get({ foo: { bar: 2 } }, toCompiledPath('foo.bar.baz.qwe.asd'), 'TEST')).toBe('TEST');
  });

  it('should return actual nullish value instead of default', () => {
    expect(get({ foo: { bar: null } }, toCompiledPath('foo.bar'), 'TEST')).toBe(null);
    expect(get({ foo: { bar: undefined } }, toCompiledPath('foo.bar'), 'TEST')).toBe(undefined);
    expect(get({ foo: { bar: 0 } }, toCompiledPath('foo.bar'), 'TEST')).toBe(0);
    expect(get({ foo: { bar: '' } }, toCompiledPath('foo.bar'), 'TEST')).toBe('');
  });

  it('should delete value by path', () => {
    const value = { foo: { bar: 2, baz: 3 } };
    del(value, toCompiledPath('foo.bar'));
    expect(value).toEqual({ foo: { baz: 3 } });

    const value2 = { foo: { bar: { baz: 3 }, zab: 4 } };
    del(value2, toCompiledPath('foo.bar'));
    expect(value2).toEqual({ foo: { zab: 4 } });
  });

  it("should not delete path that doesn't exist", () => {
    const value = { foo: { bar: 2, baz: 3 } };
    del(value, toCompiledPath('test1.test2.test3.test4'));
    expect(value).toEqual({ foo: { bar: 2, baz: 3 } });
  });

  it('should set value by path', () => {
    const test = { foo: { bar: 2 } };
    set(test, toCompiledPath('foo.bar'), 4);
    expect(test.foo.bar).toBe(4);
  });

  it('should set value by non-existent path', () => {
    const test = { foo: {} };
    set(test, toCompiledPath('foo.bar.baz'), 4);
    // @ts-expect-error
    expect(test.foo.bar.baz).toBe(4);
  });

  it('should set value by non-existent path within the array', () => {
    const test = { foo: {} };
    set(test, toCompiledPath('foo.bar.0.baz'), 4);
    // @ts-expect-error
    expect(test.foo.bar[0].baz).toBe(4);
  });
});
