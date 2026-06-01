import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { h } from 'vue';
import * as v from 'valibot';

import { useForm as useFormLib, type FormContext } from '../lib';
import type { FieldMeta } from '../field-metadata';
import VardenField from './VardenField.vue';

function useForm<T, O>(
  ...args: Parameters<typeof useFormLib<T, O>>
): FormContext<T> & { __meta: Map<string, FieldMeta> } {
  return useFormLib<T, O>(...args) as FormContext<T> & { __meta: Map<string, FieldMeta> };
}

describe('meta management', () => {
  it('should render field value through component', async () => {
    const form = useForm({
      schema: v.object({ name: v.string() }),
      onSubmit: () => {},
    });

    const wrapper = mount(VardenField, {
      // @ts-expect-error typed vue component
      props: { form, path: 'name' },
      slots: {
        default: ({ field, errors }: { field: { modelValue: string }; errors: readonly string[] | null }) => h('div', [
          h('input', {
            'data-testid': 'name-input',
            value: field.modelValue,
            onInput: (e: Event) => {
              // eslint-disable-next-line no-param-reassign
              field.modelValue = (e.target as HTMLInputElement).value;
            },
          }),
          h('span', { 'data-testid': 'error' }, errors?.[0] ?? ''),
        ]),
      },
    });

    expect(form.__meta.get('name')?.refCount).toBe(1);
    expect(wrapper.find('[data-testid="name-input"]').exists()).toBe(true);

    wrapper.unmount();

    expect(form.__meta.get('name')).toBeUndefined();
  });

  it('should not reset field value when another component instance still references it', async () => {
    const form = useForm({
      schema: v.object({ name: v.string() }),
      onSubmit: () => {},
    });

    const wrapper1 = mount(VardenField, {
      // @ts-expect-error typed vue component
      props: { form, path: 'name' },
      slots: {
        default: ({ field }: { field: { modelValue: string } }) => h('input', {
          'data-testid': 'name-input-1',
          value: field.modelValue,
          onInput: (e: Event) => {
            // eslint-disable-next-line no-param-reassign
            field.modelValue = (e.target as HTMLInputElement).value;
          },
        }),
      },
    });

    const wrapper2 = mount(VardenField, {
      // @ts-expect-error typed vue component
      props: { form, path: 'name' },
      slots: {
        default: ({ field }: { field: { modelValue: string } }) => h('input', {
          'data-testid': 'name-input-2',
          value: field.modelValue,
        }),
      },
    });

    expect(form.__meta.get('name')?.refCount).toBe(2);

    form.setValue('name', 'TestValue');
    expect(form.values.value.name).toBe('TestValue');

    wrapper1.unmount();
    expect(form.__meta.get('name')?.refCount).toBe(1);
    expect(form.values.value.name).toBe('TestValue');

    wrapper2.unmount();
    expect(form.__meta.get('name')).toBeUndefined();
    expect(form.values.value.name).toBe(undefined);
  });
});
