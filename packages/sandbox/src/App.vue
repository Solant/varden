<script setup lang="ts">
import { VardenForm, VardenInput, useForm } from 'varden';
import * as v from 'valibot';
import { ref } from 'vue';

const form = useForm({
  onSubmit(data) {
    alert(JSON.stringify(data));
  },
  schema: v.object({ email: v.pipe(v.string(), v.email()), password: v.string(), something: v.any() }),
  initial: { email: '', password: '' },
});

const checkbox = ref(false);
</script>

<template>
  <div>
    {{ form.values }}
    <varden-form :form>
      <varden-input :form path="email" v-slot="{ field, error }">
        <label>
          Email
          <input v-bind="field" />
        </label>
        <div v-if="error">{{ error }}</div>
      </varden-input>

      <varden-input :form path="password" v-slot="{ field, error }">
        <label>
          Password
          <input v-bind="field" type="password" />
        </label>
        <div v-if="error">{{ error }}</div>
      </varden-input>

      <input type="checkbox" v-model="checkbox" />

      <varden-input :form path="something" v-slot="{ field }" v-if="checkbox">
        <label>
          Something
          <input v-bind="field" />
        </label>
      </varden-input>

      <div>
        <button type="submit">Submit</button>
        <button type="reset">Reset</button>
      </div>
    </varden-form>
  </div>
</template>
