import { describe, expect, it } from 'vitest';
import * as v from 'valibot';

import { useForm } from '../src/lib';

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
