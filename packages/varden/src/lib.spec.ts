import { describe, expect, it } from 'vitest';
import * as v from 'valibot';

import { useForm } from './lib';

describe('form reset', () => {
  it('should reset form values', () => {
    const form = useForm({
      initial: { name: 'John' },
      schema: v.object({ name: v.string() }),
      onSubmit(values) {
        console.log(values);
      },
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
      onSubmit(values) {
        console.log(values);
      },
    });
    expect(form.dirty.value).toBe(false);

    form.setValue('name', 'Jane');
    expect(form.dirty.value).toBe(true);
  });
});
