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
