import {
  describe, expect, it, vi,
} from 'vitest';
import * as v from 'valibot';
import { effectScope } from 'vue';

import { useForm as useFormLib, type FormContext } from './lib';
import { useFieldValue } from './composables';
import type { FieldMeta } from './field-metadata';

function useForm<T, O>(
  ...args: Parameters<typeof useFormLib<T, O>>
): FormContext<T> & { __meta: Map<string, FieldMeta> } {
  return useFormLib<T, O>(...args) as FormContext<T> & { __meta: Map<string, FieldMeta> };
}

describe('form submit', () => {
  it('should submit form data without cloning issue', async () => {
    const onSubmit = vi.fn();

    const form = useForm({
      schema: v.object({ name: v.string() }),
      onSubmit,
    });

    form.setValue('name', 'Test');
    form.submit();
    expect(onSubmit).toHaveBeenCalledWith({ name: 'Test' });
  });

  it('should transform values according to schema', () => {
    const onSubmit = vi.fn();

    const form = useForm({
      schema: v.object({
        name: v.pipe(
          v.string(),
          v.transform((input) => input.length),
        ),
      }),
      onSubmit,
    });

    form.setValue('name', 'Test');
    form.submit();
    expect(onSubmit).toHaveBeenCalledWith({ name: 4 });
  });
});

describe('meta management', () => {
  it('should not reset field that is currently referenced', () => {
    const form = useForm({
      schema: v.object({ name: v.string() }),
      onSubmit: () => { },
    });

    const name = useFieldValue(form, 'name');
    name.value = 'Jack';

    const scope = effectScope();
    scope.run(() => {
      const name2 = useFieldValue(form, 'name');
      expect(name2.value).toBe('Jack');
      expect(form.__meta.get('name')?.refCount).toBe(2);
    });
    scope.stop();

    expect(form.__meta.get('name')?.refCount).toBe(1);
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
      const name = useFieldValue(form, 'name');
      name.value = 'Jack';
      expect(form.values.value.name).toBe('Jack');
    });
    scope.stop();

    expect(form.values.value.name).toBe(undefined);
  });
});
