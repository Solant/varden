<script lang="ts" setup>
import { useFieldError, useFieldValue, useForm } from 'varden';
import * as v from 'valibot';

const form = useForm({
  schema: v.object({
    email: v.pipe(v.string(), v.email()),
    password: v.pipe(v.string(), v.minLength(8)),
  }),
  onSubmit(value) {
    // eslint-disable-next-line no-console
    console.log(value);
  },
});

const email = useFieldValue(form, 'email');
const emailError = useFieldError(form, 'email');

const password = useFieldValue(form, 'password');
const passwordError = useFieldError(form, 'password');
</script>

<template>
  <form @submit.prevent="form.submit">
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
