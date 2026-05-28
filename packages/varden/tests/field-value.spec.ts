import { describe, expect, it } from 'vitest';
import * as v from 'valibot';

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
});
