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
    expect(form.isFieldDirty('name')).toBe(true);
    expect(form.isFieldTouched('name')).toBe(true);

    form.resetField('name');
    expect(form.isFieldDirty('name')).toBe(false);
    expect(form.isFieldTouched('name')).toBe(false);
  });

  it('should reset nested fields', () => {
    const form = useForm({
      initial: { name: { first: 'John', last: 'Doe' } },
      schema: v.object({ name: v.object({ first: v.string(), last: v.string() }) }),
      onSubmit: () => { },
    });

    form.setValue('name.first', 'Jack');
    expect(form.isFieldDirty('name.first')).toBe(true);

    form.resetField('name');

    expect(form.values.value.name?.first).toBe('John');
    expect(form.isFieldDirty('name.first')).toBe(false);
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

  it('should reset value on parent reset', () => {
    const form = useForm({
      schema: v.object({ foo: v.object({ bar: v.string() }) }),
      initial: { foo: { bar: 'Initial' } },
      onSubmit: () => { },
    });

    form.setValue('foo.bar', 'Test');
    form.resetField('foo');
    expect(form.values.value.foo?.bar).toBe('Initial');
  });
});

describe('field reset metadata', () => {
  it('should delete unused metadata', () => {
    const form = useForm({
      schema: v.object({ foo: v.string() }),
      onSubmit: () => { },
    });

    form.setValue('foo', 'Test');
    expect(form.isFieldDirty('foo')).toBe(true);

    form.resetField('foo');
    expect(form.isFieldDirty('foo')).toBe(false);
  });

  it('should update metadata for registered field', () => {
    const form = useForm({
      schema: v.object({ foo: v.string() }),
      onSubmit: () => { },
    });

    const foo = form.useFieldValue('foo');
    foo.value = 'Test';
    expect(form.isFieldDirty('foo')).toBe(true);

    form.resetField('foo');
    expect(form.isFieldDirty('foo')).toBe(false);
  });

  it('should delete unused child metadata', () => {
    const form = useForm({
      schema: v.object({ foo: v.object({ bar: v.string() }) }),
      onSubmit: () => { },
    });

    form.setValue('foo.bar', 'Test');
    form.resetField('foo');
    expect(form.isFieldDirty('foo.bar')).toBe(false);
  });

  it('should update metadata for child registered field', () => {
    const form = useForm({
      schema: v.object({ foo: v.object({ bar: v.string() }) }),
      onSubmit: () => { },
    });

    const bar = form.useFieldValue('foo.bar');
    bar.value = 'Test';
    expect(form.isFieldDirty('foo.bar')).toBe(true);

    form.resetField('foo');
    expect(form.isFieldDirty('foo.bar')).toBe(false);
  });
});
