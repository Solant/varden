<script lang="ts" setup generic="T, Path extends Paths<T>">
import type { Paths, Get } from '../path';

import type { FormContext } from '../lib';

const props = defineProps<{
  form: FormContext<T>;
  path: Path;
}>();

const [modelValue, onBlur, error] = props.form.useField(props.path);

function update(value: Get<T, Path>) {
  modelValue.value = value;
}
</script>

<template>
  <slot :field="{ modelValue, 'onUpdate:modelValue': update, onBlur }" :error />
</template>
