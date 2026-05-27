import { describe, expect, it } from 'vitest';
import * as v from 'valibot';

import { useForm as useFormLib, type FormContext } from '../src/lib';
import { useFieldValue } from '../src/composables';
import type { FieldMeta } from '../src/field-metadata';

function useForm<T>(
  ...args: Parameters<typeof useFormLib<T>>
): FormContext<T> & { __meta: Map<string, FieldMeta> } {
  return useFormLib<T>(...args) as FormContext<T> & { __meta: Map<string, FieldMeta> };
}

describe('form reset', () => {
  it('should reset form values', () => {
    const form = useForm({
      initial: { name: 'John' },
      schema: v.object({ name: v.string() }),
      onSubmit: () => { },
    });

    expect(form.values.value.name).toBe('John');

    form.setValue('name', 'Jane');
    expect(form.values.value.name, 'Jane');

    form.reset();
    expect(form.values.value.name, 'John');
  });

  it('should reset dirty state for the form', () => {
    const form = useForm({
      initial: { name: 'John' },
      schema: v.object({ name: v.string() }),
      onSubmit: () => { },
    });
    expect(form.dirty.value).toBe(false);

    form.setValue('name', 'Jane');
    expect(form.dirty.value).toBe(true);
  });

  it('initial values should be immutable', () => {
    const initial = { name: 'John' };
    const form = useForm({
      initial,
      schema: v.object({ name: v.string() }),
      onSubmit: () => { },
    });

    initial.name = 'Jane';
    form.reset();

    expect(form.values.value.name).toBe('John');
  });
});

describe('form reset meta', () => {
  it('should delete unused field meta', () => {
    const form = useForm({
      initial: { name: 'John' },
      schema: v.object({ name: v.string() }),
      onSubmit: () => { },
    });

    form.setValue('name', 'Jack');
    form.reset();
    expect(form.__meta.get('name')).toBe(undefined);
  });

  it('should update metadata for registered field', () => {
    const form = useForm({
      schema: v.object({ name: v.string() }),
      onSubmit: () => { },
    });

    const name = useFieldValue(form, 'name');
    name.value = 'Jack';

    form.reset();
    expect(form.__meta.get('name')?.dirty).toBe(false);
  });
});
