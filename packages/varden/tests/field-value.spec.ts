import { describe, expect, it } from 'vitest';
import * as v from 'valibot';
import { dequal } from 'dequal';

import { useForm } from '../src/lib';
import { useFieldValue } from '../src/composables';

const onSubmit = () => { };

describe('form.setValue plain', () => {
  it('should set the value of a field', () => {
    const form = useForm({
      onSubmit: () => { },
      schema: v.object({ name: v.string() }),
    });

    form.setValue('name', 'foo');
    expect(form.values.value.name).toBe('foo');
    expect(form.isDirty('name')).toBe(true);
  });

  it('should treat undefined and missing field as dirty (shallow)', () => {
    const form = useForm({
      onSubmit,
      schema: v.object({ foo: v.string() }),
    });

    form.setValue('foo', undefined);
    expect(form.values.value?.foo).toBe(undefined);
    expect(form.isDirty('foo')).toBe(true);
  });

  it('should treat undefined and missing field as dirty (deep)', () => {
    const form = useForm({
      onSubmit,
      schema: v.object({ foo: v.object({ bar: v.string() }) }),
    });

    form.setValue('foo.bar', undefined);
    expect(form.values.value?.foo?.bar).toBe(undefined);
    expect(form.isDirty('foo.bar')).toBe(true);
  });
});

describe('form.setValue object', () => {
  it('should set the value of an object field', () => {
    const form = useForm({
      onSubmit: () => { },
      schema: v.object({ user: v.object({ name: v.string() }) }),
    });

    form.setValue('user', { name: 'foo' });
    expect(form.values.value?.user).toEqual({ name: 'foo' });
    expect(form.isDirty('user')).toBe(true);
  });

  it('should set copied value of an object field', () => {
    const form = useForm({
      onSubmit: () => { },
      schema: v.object({ user: v.object({ name: v.string() }) }),
    });

    const value = { name: 'foo' };
    form.setValue('user', value);
    value.name = 'bar';

    expect(form.values.value?.user).toEqual({ name: 'foo' });
    expect(form.isDirty('user')).toBe(true);
  });

  it('should reset child metadata', () => {
    const form = useForm({
      onSubmit: () => { },
      schema: v.object({ user: v.object({ name: v.string() }) }),
    });

    form.setValue('user.name', 'foo');
    form.setValue('user', undefined);

    expect(form.values.value?.user?.name).toBeUndefined();
    expect(form.isDirty('user.name')).toBe(false);
  });

  it('should keep child metadata for registered fields', () => {
    const form = useForm({
      onSubmit: () => { },
      schema: v.object({ user: v.object({ name: v.string() }) }),
    });

    const name = useFieldValue(form, 'user.name');
    name.value = 'foo';
    form.setTouched('user.name');
    form.setValue('user', undefined);

    expect(form.values.value?.user?.name).toBeUndefined();
    expect(form.isDirty('user.name')).toBe(false);
    expect(form.isTouched('user.name')).toBe(true);
  });

  it('should mark child as not dirty when parent is set to initial values', () => {
    const form = useForm({
      onSubmit: () => { },
      initial: { user: { name: 'initial' } },
      schema: v.object({ user: v.object({ name: v.string() }) }),
    });

    const name = useFieldValue(form, 'user.name');
    name.value = 'changed';
    expect(form.isDirty('user.name')).toBe(true);

    form.setValue('user', { name: 'initial' });

    expect(form.values.value?.user?.name).toBe('initial');
    expect(form.isDirty('user.name')).toBe(false);
  });

  it('should mark child as dirty when parent is set to different values', () => {
    const form = useForm({
      onSubmit: () => { },
      initial: { user: { name: 'initial' } },
      schema: v.object({ user: v.object({ name: v.string() }) }),
    });

    useFieldValue(form, 'user.name');
    expect(form.isDirty('user.name')).toBe(false);

    form.setValue('user', { name: 'changed' });

    expect(form.values.value?.user?.name).toBe('changed');
    expect(form.isDirty('user.name')).toBe(true);
  });

  it('should treat untracked parent as dirty if child is dirty', () => {
    const form = useForm({
      onSubmit,
      schema: v.object({ user: v.object({ name: v.string() }) }),
    });

    form.setValue('user.name', 'test');
    expect(form.isDirty('user')).toBe(true);
  });

  it('should treat child as dirty when parent affects child field state', () => {
    const form = useForm({
      onSubmit,
      schema: v.object({ user: v.object({ name: v.string() }) }),
    });

    form.setValue('user', { name: 'Jack' });
    expect(form.isDirty('user.name')).toBe(true);
  });

  it('should mark parent dirty if child is changed back to original value', () => {
    const form = useForm({
      onSubmit,
      initial: { user: { name: 'initial' } },
      equalsFn: dequal,
      schema: v.object({ user: v.object({ name: v.string() }) }),
    });

    form.setValue('user', { name: 'changed' });
    form.setValue('user.name', 'initial');
    expect(form.isDirty('user')).toBe(false);
  });

  it('should return a safe copy of the value', () => {
    const form = useForm({
      onSubmit,
      schema: v.object({ user: v.object({ name: v.string() }) }),
    });
    form.setValue('user', { name: 'initial' });
    const a = form.getValue('user');
    a.name = 'changed';
    expect(form.values.value.user?.name).toBe('initial');
  });
});

describe('form arrays', () => {
  it('should push into existing array', () => {
    const form = useForm({
      onSubmit,
      schema: v.object({ users: v.array(v.object({ name: v.string() })) }),
    });

    form.setValue('users', []);
    form.push('users', { name: 'test' });
    expect(form.values.value.users).toEqual([{ name: 'test' }]);
  });

  it('should create a new array if none exists', () => {
    const form = useForm({
      onSubmit,
      schema: v.object({ users: v.array(v.object({ name: v.string() })) }),
    });

    form.push('users', { name: 'test' });
    expect(form.values.value.users).toEqual([{ name: 'test' }]);
  });

  it('should pop from existing array', () => {
    const form = useForm({
      onSubmit,
      schema: v.object({ users: v.array(v.object({ name: v.string() })) }),
    });

    form.setValue('users', [{ name: 'a' }, { name: 'b' }]);
    const popped = form.pop('users');
    expect(popped).toEqual({ name: 'b' });
    expect(form.values.value.users).toEqual([{ name: 'a' }]);
  });

  it('should return undefined when popping from empty array', () => {
    const form = useForm({
      onSubmit,
      schema: v.object({ users: v.array(v.object({ name: v.string() })) }),
    });

    form.setValue('users', []);
    const popped = form.pop('users');
    expect(popped).toBeUndefined();
    expect(form.values.value.users).toEqual([]);
  });

  it('should return undefined when popping from non-existent array', () => {
    const form = useForm({
      onSubmit,
      schema: v.object({ users: v.array(v.object({ name: v.string() })) }),
    });

    const popped = form.pop('users');
    expect(popped).toBeUndefined();
  });

  it('should shift from existing array', () => {
    const form = useForm({
      onSubmit,
      schema: v.object({ users: v.array(v.object({ name: v.string() })) }),
    });

    form.setValue('users', [{ name: 'a' }, { name: 'b' }]);
    const shifted = form.shift('users');
    expect(shifted).toEqual({ name: 'a' });
    expect(form.values.value.users).toEqual([{ name: 'b' }]);
  });

  it('should return undefined when shifting from empty array', () => {
    const form = useForm({
      onSubmit,
      schema: v.object({ users: v.array(v.object({ name: v.string() })) }),
    });

    form.setValue('users', []);
    const shifted = form.shift('users');
    expect(shifted).toBeUndefined();
    expect(form.values.value.users).toEqual([]);
  });

  it('should return undefined when shifting from non-existent array', () => {
    const form = useForm({
      onSubmit,
      schema: v.object({ users: v.array(v.object({ name: v.string() })) }),
    });

    const shifted = form.shift('users');
    expect(shifted).toBeUndefined();
  });

  it('should unshift into existing array', () => {
    const form = useForm({
      onSubmit,
      schema: v.object({ users: v.array(v.object({ name: v.string() })) }),
    });

    form.setValue('users', [{ name: 'a' }]);
    form.unshift('users', { name: 'b' });
    expect(form.values.value.users).toEqual([{ name: 'b' }, { name: 'a' }]);
  });

  it('should create a new array when unshifting into non-existent array', () => {
    const form = useForm({
      onSubmit,
      schema: v.object({ users: v.array(v.object({ name: v.string() })) }),
    });

    form.unshift('users', { name: 'test' });
    expect(form.values.value.users).toEqual([{ name: 'test' }]);
  });

  it('should splice to insert items at index', () => {
    const form = useForm({
      onSubmit,
      schema: v.object({ users: v.array(v.object({ name: v.string() })) }),
    });

    form.setValue('users', [{ name: 'a' }, { name: 'c' }]);
    form.splice('users', 1, 0, { name: 'b' });
    expect(form.values.value.users).toEqual([{ name: 'a' }, { name: 'b' }, { name: 'c' }]);
  });

  it('should splice to remove items at index', () => {
    const form = useForm({
      onSubmit,
      schema: v.object({ users: v.array(v.object({ name: v.string() })) }),
    });

    form.setValue('users', [{ name: 'a' }, { name: 'b' }, { name: 'c' }]);
    form.splice('users', 1, 1);
    expect(form.values.value.users).toEqual([{ name: 'a' }, { name: 'c' }]);
  });

  it('should splice to replace items at index', () => {
    const form = useForm({
      onSubmit,
      schema: v.object({ users: v.array(v.object({ name: v.string() })) }),
    });

    form.setValue('users', [{ name: 'a' }, { name: 'b' }, { name: 'c' }]);
    form.splice('users', 1, 1, { name: 'x' });
    expect(form.values.value.users).toEqual([{ name: 'a' }, { name: 'x' }, { name: 'c' }]);
  });

  it('should create a new array when splicing into non-existent array', () => {
    const form = useForm({
      onSubmit,
      schema: v.object({ users: v.array(v.object({ name: v.string() })) }),
    });

    form.splice('users', 0, 0, { name: 'a' }, { name: 'b' });
    expect(form.values.value.users).toEqual([{ name: 'a' }, { name: 'b' }]);
  });

  it('should use defaults when splice is called without index or deleteCount', () => {
    const form = useForm({
      onSubmit,
      schema: v.object({ users: v.array(v.object({ name: v.string() })) }),
    });

    form.setValue('users', [{ name: 'a' }]);
    form.splice('users');
    expect(form.values.value.users).toEqual([{ name: 'a' }]);
  });
});
