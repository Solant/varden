import { describe, expect, it } from 'vitest';
import * as v from 'valibot';
import { effectScope } from 'vue';

import { useForm } from './lib';

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

  it('should set dirty state for the form', () => {
    const form = useForm({
      initial: { name: 'John' },
      schema: v.object({ name: v.string() }),
      onSubmit: () => { },
    });
    expect(form.dirty.value).toBe(false);

    form.setValue('name', 'Jane');
    expect(form.dirty.value).toBe(true);
  });

  it('should reset to original initial values when initial object is mutated', () => {
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
      expect(form.meta.name?.refCount).toBe(2);
    });
    scope.stop();

    expect(form.meta.name?.refCount).toBe(1);
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
