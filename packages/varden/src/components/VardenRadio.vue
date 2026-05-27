<script lang="ts" setup generic="T, Path extends Paths<T>">
import { computed, toRaw } from 'vue';

import type { Paths, Get } from '../path';
import type { FormContext } from '../lib';
import { useField } from '../composables';

const props = defineProps<{
  form: FormContext<T>;
  path: Path;
  value: Get<T, Path>;
}>();

const [
  model,
  onBlur,
  error,
] = useField(props.form, props.path);

function update(event: Event) {
  const target = event.target as HTMLInputElement | null;
  if (target) {
    model.value = props.value;
    onBlur();
  }
}

const checked = computed(() => toRaw(model.value) === props.value);
</script>

<template>
  <slot
    :field="{ checked, value, onChange: update, onBlur, type: 'radio' }"
    :error
  />
</template>
