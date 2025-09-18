<script lang="ts" setup generic="T, Path extends Paths<T>">
import type { Paths, Get } from '../path';
import { computed, toRaw } from 'vue';

import type { FormContext } from '../lib';

const props = defineProps<{
  form: FormContext<T>;
  path: Path;
  value: Get<T, Path>;
}>();

const [model, onBlur, error] = props.form.useField(props.path);

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
  <slot :field="{ checked, value, onChange: update, onBlur, type: 'radio' }" :error />
</template>
