import { describe, expect, it } from 'vitest';
import * as v from 'valibot';
import { effectScope } from 'vue';

import { useForm } from './lib';

describe('meta management', () => {
  it('should not reset field that is currently referenced', () => {
    const form = useForm({
      schema: v.object({ name: v.string() }),
      onSubmit: () => { },
    });

    const name = form.useFieldValue('name');
    name.value = 'Jack';

    const scope = effectScope();
    scope.run(() => {
      const name2 = form.useFieldValue('name');
      expect(name2.value).toBe('Jack');
      expect(form.meta.get('name')?.refCount).toBe(2);
    });
    scope.stop();

    expect(form.meta.get('name')?.refCount).toBe(1);
    expect(name.value).toBe('Jack');
  });

  it('should reset field that is no longer referenced', () => {
    const form = useForm({
      schema: v.object({ name: v.string() }),
      onSubmit: () => { },
    });
    expect(form.values.value.name).toBe(undefined);

    const scope = effectScope();
    scope.run(() => {
      const name = form.useFieldValue('name');
      name.value = 'Jack';
      expect(form.values.value.name).toBe('Jack');
    });
    scope.stop();

    expect(form.values.value.name).toBe(undefined);
  });
});

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

  it('should reset field metadata', () => {
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
    expect(form.meta.get('name')?.dirty).toBe(false);
    expect(form.meta.get('name')?.touched).toBe(false);
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
    expect(form.meta.get('name.first')?.dirty).toBe(false);
  });

  it.only('should cleanup nested path for the field', () => {
    const form = useForm({
      schema: v.object({ foo: v.object({ bar: v.object({ baz: v.string() }) }) }),
      onSubmit: () => { },
    });

    form.setValue('foo.bar.baz', 'Test');
    form.resetField('foo.bar.baz');
    expect(form.values.value).toStrictEqual({});
  });

  it.only('should not delete nested path if sibling fields exist', () => {
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
