import {
  afterAll,
  describe, expect, it,
} from 'vitest';
import { dequal } from 'dequal';
import * as v from 'valibot';

import { useForm, defineVardenConfig, resetVardenConfig } from '../src/lib';

describe('form defineVardenConfig', () => {
  afterAll(() => {
    resetVardenConfig();
  });

  it('should use settings from defineVardenConfig', () => {
    defineVardenConfig({
      equalsFn: dequal,
      cloneFn: structuredClone,
    });

    const form = useForm({
      equalsFn: dequal,
      schema: v.object({ foo: v.object({ bar: v.string() }) }),
      initial: { foo: { bar: '' } },
      onSubmit: () => { },
    });

    form.setValue('foo', { bar: '' });
    expect(form.isDirty('foo')).toBe(false);
  });
});

describe('form equalsFn', () => {
  it('should use equalsFn to compare values', () => {
    const form = useForm({
      equalsFn: dequal,
      schema: v.object({ foo: v.object({ bar: v.string() }) }),
      initial: { foo: { bar: '' } },
      onSubmit: () => { },
    });

    form.setValue('foo', { bar: '' });
    expect(form.isDirty('foo')).toBe(false);
  });

  it('should use IsStrictlyEqual by default', () => {
    const form = useForm({
      schema: v.object({ foo: v.object({ bar: v.string() }) }),
      initial: { foo: { bar: '' } },
      onSubmit: () => { },
    });

    form.setValue('foo', { bar: '' });
    expect(form.isDirty('foo')).toBe(true);
  });
});
