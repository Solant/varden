<script lang="ts" setup>
import type { FormContext } from '@';

defineProps<{ form: FormContext<unknown> }>();
</script>

<template>
  <form @submit.prevent="form.submit" @reset.prevent="form.reset">
    <slot />
  </form>
</template>
