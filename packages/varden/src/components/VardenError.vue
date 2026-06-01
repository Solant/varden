<script lang="ts" setup generic="T, Path extends Paths<T>">
import type { Paths } from '../path';
import type { FormContext } from '../lib';
import { useFieldErrors } from '../composables';

const props = defineProps<{
  form: FormContext<T>;
  path: Path;
}>();

const errors = useFieldErrors(props.form, props.path);
</script>

<template>
  <slot :errors />
</template>
