<script lang="ts" setup generic="T, Path extends Paths<T>">
import type { Paths } from '../path';

import type { FormContext } from '../lib';

const props = defineProps<{
  form: FormContext<T>;
  path: Path;
}>();

const error = props.form.useFieldError(props.path);
</script>

<template>
  <slot :error />
</template>
