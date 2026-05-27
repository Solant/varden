<script lang="ts" setup generic="T, Path extends Paths<T>">
import type { Paths } from '../path';
import type { FormContext } from '../lib';
import { useFieldError } from '../composables';

const props = defineProps<{
  form: FormContext<T>;
  path: Path;
}>();

const error = useFieldError(props.form, props.path);
</script>

<template>
  <slot :error />
</template>
