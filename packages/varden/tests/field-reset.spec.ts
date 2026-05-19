import { describe, expect, it } from 'vitest';
import * as v from 'valibot';

import { useForm } from '../src/lib';

describe('resetField', () => {
  it('should reset field to initial value', () => {
    const form = useForm({
      initial: { name: 'John' },
      schema: v.object({ name: v.string() }),
      onSubmit: () => { },
    });

    form.setValue('name', 'Jack');
    form.resetField('name');

    expect(form.values.value.name).toBe('John');
  });

  it('should delete field metadata', () => {
    const form = useForm({
      initial: { name: 'John' },
      schema: v.object({ name: v.string() }),
      onSubmit: () => { },
    });

    form.setValue('name', 'Jack');
    form.setTouched('name', true);
    expect(form.meta.get('name')?.dirty).toBe(true);
    expect(form.meta.get('name')?.touched).toBe(true);

    form.resetField('name');
    expect(form.meta.get('name')?.dirty).toBe(undefined);
    expect(form.meta.get('name')?.touched).toBe(undefined);
  });

  it('should reset nested fields', () => {
    const form = useForm({
      initial: { name: { first: 'John', last: 'Doe' } },
      schema: v.object({ name: v.object({ first: v.string(), last: v.string() }) }),
      onSubmit: () => { },
    });

    form.setValue('name.first', 'Jack');
    expect(form.meta.get('name.first')?.dirty).toBe(true);

    form.resetField('name');

    expect(form.values.value.name?.first).toBe('John');
    expect(form.meta.get('name.first')?.dirty).toBe(undefined);
  });

  it('should cleanup parent path for the field', () => {
    const form = useForm({
      schema: v.object({ foo: v.object({ bar: v.object({ baz: v.string() }) }) }),
      onSubmit: () => { },
    });

    form.setValue('foo.bar.baz', 'Test');
    form.resetField('foo.bar.baz');
    expect(form.values.value).toStrictEqual({});
  });

  it('should cleanup child path for the field', () => {
    const form = useForm({
      schema: v.object({ foo: v.object({ bar: v.object({ baz: v.string() }) }) }),
      onSubmit: () => { },
    });

    form.setValue('foo.bar.baz', 'Test');
    form.resetField('foo.bar');
    expect(form.values.value).toStrictEqual({});
  });

  it('should not delete nested path if sibling fields exist', () => {
    const form = useForm({
      schema: v.object({ foo: v.object({ bar: v.object({ baz: v.string() }), qux: v.string() }) }),
      onSubmit: () => { },
    });

    form.setValue('foo.bar.baz', 'Test');
    form.setValue('foo.qux', 'Test2');
    form.resetField('foo.bar.baz');
    expect(form.values.value).toStrictEqual({ foo: { qux: 'Test2' } });
  });
});
