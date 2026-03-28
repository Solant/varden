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

function onInput(event: Event) {
  const target = event.target as HTMLInputElement | null;
  if (target) {
    // @ts-expect-error html input value type is unknown
    model.value = target.value;
  }
}
</script>

<template>
  <slot
    :field="{ value: model, onInput, onBlur }"
    :error
  />
</template>
