import { describe, expect, it } from 'vitest';
import * as v from 'valibot';

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

  it('should validate initial value type', () => {
    expect(() => {
      useForm({
        // @ts-expect-error test case
        initial: 'not-an-object',
        schema: v.object({ name: v.string() }),
        onSubmit: () => { },
      });
    }).toThrow(TypeError);
  });
});
