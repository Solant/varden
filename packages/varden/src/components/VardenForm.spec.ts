import {
  describe, expect, it, vi,
} from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick, h } from 'vue';
import * as v from 'valibot';

import { useForm as useFormLib, type FormContext } from '../lib';
import VardenForm from './VardenForm.vue';
import VardenField from './VardenField.vue';
import type { FieldMeta } from '../field-metadata';

function useForm<T, O>(
  ...args: Parameters<typeof useFormLib<T, O>>
): FormContext<T> & { __meta: Map<string, FieldMeta> } {
  return useFormLib<T, O>(...args) as FormContext<T> & { __meta: Map<string, FieldMeta> };
}

describe('meta management', () => {
  it('should preserve values when fields are actively referenced', async () => {
    const onSubmit = vi.fn();
    const form = useForm({
      schema: v.object({ name: v.optional(v.string()), email: v.optional(v.string()) }),
      onSubmit,
    });

    expect(form.__meta.get('name')).toBeUndefined();
    expect(form.__meta.get('email')).toBeUndefined();

    const wrapper = mount(VardenForm, {
      props: { form },
      slots: {
        // @ts-expect-error typed vue component
        default: () => h('div', [h(VardenField, { form, path: 'name' }), h(VardenField, { form, path: 'email' })]),
      },
    });

    expect(form.__meta.get('name')?.refCount).toBe(1);
    expect(form.__meta.get('email')?.refCount).toBe(1);

    form.setValue('name', 'John');
    form.setValue('email', 'john@example.com');

    expect(form.values.value.name).toBe('John');
    expect(form.values.value.email).toBe('john@example.com');

    wrapper.unmount();

    expect(form.__meta.get('name')).toBeUndefined();
    expect(form.__meta.get('email')).toBeUndefined();
  });

  it('should reset form values when reset is called', async () => {
    const onSubmit = vi.fn();
    const form = useForm({
      schema: v.object({ name: v.string() }),
      initial: { name: 'Initial' },
      onSubmit,
    });

    const wrapper = mount(VardenForm, {
      props: { form },
      slots: {
        // @ts-expect-error typed vue component
        default: () => h(VardenField, { form, path: 'name' }),
      },
    });

    form.setValue('name', 'Changed');

    expect(form.values.value.name).toBe('Changed');

    form.reset();
    await nextTick();

    expect(form.values.value.name).toBe('Initial');
    expect(form.isTouched('name')).toBe(false);

    wrapper.unmount();
  });

  it('should not reset field data preemptively while component still references it', async () => {
    const onSubmit = vi.fn();
    const form = useForm({
      schema: v.object({ name: v.string() }),
      onSubmit,
    });

    const wrapper = mount(VardenForm, {
      props: { form },
      slots: {
        // @ts-expect-error typed vue component
        default: () => h(VardenField, { form, path: 'name' }),
      },
    });

    form.setValue('name', 'PersistentValue');
    expect(form.values.value.name).toBe('PersistentValue');
    expect(form.__meta.get('name')?.refCount).toBe(1);

    await nextTick();
    expect(form.values.value.name).toBe('PersistentValue');

    await new Promise((resolve) => {
      setTimeout(resolve, 10);
    });
    expect(form.values.value.name).toBe('PersistentValue');

    wrapper.unmount();
    expect(form.values.value.name).toBe(undefined);
  });
});
