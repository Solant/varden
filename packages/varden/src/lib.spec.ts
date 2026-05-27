import { describe, expect, it } from 'vitest';
import * as v from 'valibot';
import { effectScope } from 'vue';

import { useForm as useFormLib, type FormContext } from './lib';
import { useFieldValue } from './composables';
import type { FieldMeta } from './field-metadata';

function useForm<T>(
  ...args: Parameters<typeof useFormLib<T>>
): FormContext<T> & { __meta: Map<string, FieldMeta> } {
  return useFormLib<T>(...args) as FormContext<T> & { __meta: Map<string, FieldMeta> };
}

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
