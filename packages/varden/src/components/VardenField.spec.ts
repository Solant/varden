import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { h } from 'vue';
import * as v from 'valibot';

import { useForm } from '../lib';
import VardenField from './VardenField.vue';

describe('meta management', () => {
  it('should render field value through component', async () => {
    const form = useForm<{ name: string }>({
      schema: v.object({ name: v.string() }),
      onSubmit: () => {},
    });

    const wrapper = mount(VardenField, {
      props: { form, path: 'name' },
      slots: {
        default: ({ field, error }: { field: { modelValue: string }; error: string }) => h('div', [
          h('input', {
            'data-testid': 'name-input',
            value: field.modelValue,
            onInput: (e: Event) => {
              // eslint-disable-next-line no-param-reassign
              field.modelValue = (e.target as HTMLInputElement).value;
            },
          }),
          h('span', { 'data-testid': 'error' }, error),
        ]),
      },
    });

    expect(form.meta.name?.refCount).toBe(1);
    expect(wrapper.find('[data-testid="name-input"]').exists()).toBe(true);

    wrapper.unmount();

    expect(form.meta.name).toBeUndefined();
  });

  it('should not reset field value when another component instance still references it', async () => {
    const form = useForm<{ name: string }>({
      schema: v.object({ name: v.string() }),
      onSubmit: () => {},
    });

    const wrapper1 = mount(VardenField, {
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
      props: { form, path: 'name' },
      slots: {
        default: ({ field }: { field: { modelValue: string } }) => h('input', {
          'data-testid': 'name-input-2',
          value: field.modelValue,
        }),
      },
    });

    expect(form.meta.name?.refCount).toBe(2);

    form.setValue('name', 'TestValue');
    expect(form.values.value.name).toBe('TestValue');

    wrapper1.unmount();
    expect(form.meta.name?.refCount).toBe(1);
    expect(form.values.value.name).toBe('TestValue');

    wrapper2.unmount();
    expect(form.meta.name).toBeUndefined();
    expect(form.values.value.name).toBe(undefined);
  });
});
