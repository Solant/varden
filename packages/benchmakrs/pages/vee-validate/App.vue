<script lang="ts" setup>
import { useForm, useField } from 'vee-validate4';
import { toTypedSchema } from '@vee-validate/valibot';
import * as v from 'valibot';

const { handleSubmit } = useForm({
  validationSchema: toTypedSchema(v.object({
    email: v.pipe(v.string(), v.email()),
    password: v.pipe(v.string(), v.minLength(8)),
  })),
});

const { value: email, errorMessage: emailError } = useField<string>('email');
const { value: password, errorMessage: passwordError } = useField<string>('password');

const onSubmit = handleSubmit((values) => {
  // eslint-disable-next-line no-console
  console.log(values);
});
</script>

<template>
  <form @submit.prevent="onSubmit">
    <!-- eslint-disable-next-line vue/no-static-inline-styles -->
    <label style="display: block">
      Email
      <input
        v-model="email"
        type="email"
        placeholder="Email"
      >
      {{ emailError }}
    </label>

    <!-- eslint-disable-next-line vue/no-static-inline-styles -->
    <label style="display: block">
      Password
      <input
        v-model="password"
        type="password"
        placeholder="Password"
      >
      {{ passwordError }}
    </label>

    <button type="submit">
      Submit
    </button>
  </form>
</template>
