import { describe, expect, it } from 'vitest';
import * as v from 'valibot';

import { useForm } from '../src/lib';

describe('form errors', () => {
  it('should return multiple errors for a field', () => {
    const form = useForm({
      onSubmit: () => {},
      schema: v.object({
        email: v.pipe(
          v.string(),
          v.minLength(5, 'too short'),
          v.email('invalid email'),
        ),
      }),
    });

    form.setValue('email', 'a@');

    const errors = form.getErrors('email');
    expect(errors).toEqual(['too short', 'invalid email']);
  });

  it('should return null when field has no errors', () => {
    const form = useForm({
      onSubmit: () => {},
      schema: v.object({
        name: v.string(),
      }),
    });

    form.setValue('name', 'valid');

    const errors = form.getErrors('name');
    expect(errors).toBeNull();
  });
});
