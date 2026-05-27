<script lang="ts" setup generic="T, Path extends Paths<T>">
import type { Paths, Get } from '../path';
import type { FormContext } from '../lib';
import { useField } from '../composables';

const props = defineProps<{
  form: FormContext<T>;
  path: Path;
}>();

const [
  modelValue,
  onBlur,
  error,
] = useField(props.form, props.path);

function update(value: Get<T, Path>) {
  modelValue.value = value;
}
</script>

<template>
  <slot
    :field="{ modelValue, 'onUpdate:modelValue': update, onBlur }"
    :error
  />
</template>
