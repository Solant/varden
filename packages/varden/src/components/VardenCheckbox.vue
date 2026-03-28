<script lang="ts" setup generic="T, Path extends Paths<T>">
import type { Paths } from '../path';
import type { FormContext } from '../lib';

const props = defineProps<{
  form: FormContext<T>;
  path: Path;
}>();

const [
  model,
  onBlur,
  error,
] = props.form.useField(props.path);

function update(event: Event) {
  const target = event.target as HTMLInputElement | null;
  if (target) {
    // @ts-expect-error html input value type is unknown
    model.value = !model.value;
    onBlur();
  }
}
</script>

<template>
  <slot
    :field="{ checked: Boolean(model), onChange: update, onBlur, type: 'checkbox' }"
    :error
  />
</template>
