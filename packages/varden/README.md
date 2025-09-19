# varden

[![bundle-size](https://deno.bundlejs.com/badge?q=varden&config={%22esbuild%22:{%22external%22:[%22vue%22]}})](https://bundlejs.com/?q=varden&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22vue%22%5D%7D%7D)

`varden` is a form validation library for Vue 3. It is designed from the ground up to address some issues of other
existing libraries, such as:

- Bundle size
- Type safety
- Field meta state management
- Concise API

## Usage

Depending on your needs, you can choose either script-based API or component-based API

### Component-based API

This approach wraps form content into `varden-form` component, and every form field is wrapped into one of the components:
- `varden-field` - applies `field` binging for vue components
- `varden-input` - applies `field` binding for native `input` text element
- `varden-radio` - applies `field` binding for native `input` radio element
- `varden-checkbox` - applies `field` binding for native `input` checkbox element

Remember to pass `form` prop to both form and field components and apply `field` binding via `v-bind="field"` to all form fields.

```vue

<script setup lang="ts">
  import { useForm } from 'varden'
  import * as v from 'valibot'

  const form = useForm({
    schema: v.object({ name: v.string(), password: v.string() }),
    onSubmit(data) {
      console.log('Sending', data)
    },
  })
</script>

<template>
  <varden-form :form>
    <varden-input :form path="name" v-slot="{ field, error }">
      <label>Name</label>
      <input v-bind="field" />
      {{ error }}
    </varden-input>

    <varden-input :form path="password" v-slot="{ field, error }">
      <label>Password</label>
      <input v-bind="field" />
      {{ error }}
    </varden-input>
    
    <button type="submit">Submit</button>
  </varden-form>
</template>
```

### Script-based API

This approach uses `useFiled` to create field bindings that you have to apply manually to your form fields. This approach
is more flexible but requires more boilerplate code. You can use it if you want to use custom field components without `varden-*` components

```vue

<script setup lang="ts">
  import { useForm } from 'varden'
  import * as v from 'valibot'

  const form = useForm({
    schema: v.object({ name: v.string(), password: v.string() }),
    onSubmit(data) {
      console.log('Sending', data)
    },
  })
  
  const [name, nameBlur, nameError] = form.useField('name')
  const [password, passwordBlur, passwordError] = form.useField('password')
</script>

<template>
  <form @submit.prevent="form.submit" @reset.prevent="form.reset">
    <label>Name</label>
    <input v-model="name" @blur="nameBlur" />
    {{ nameError }}

    <label>Name</label>
    <input v-model="password" @blur="passwordBlur" />
    {{ passwordError }}

    <button type="submit">Submit</button>
  </form>
</template>
```

## Validation

`varden` doesn't provide any built-it validation rules. Instead, it
implements [Standard Schema](https://standardschema.dev) interface, which means you can use any validation library you
want:

- zod `3.24.0+`
- valibot `1.0+`
- ArkType `2.0+`
- Effect Schema `3.13.0+`
- Arri Schema `0.71.0+`
- TypeMap `0.8.0+`
- Formgator `0.1.0+`
- decoders `2.6.0+`
- ReScript Schema `9.2.0+`
- Skunkteam Types `9.0.0+`
- DreamIt GraphQL-Std-Schema `0.1.0+`
- ts.data.json `2.3.0`
- unhoax `0.7.0+`
- yup `1.7.0+`
- joi `18.0.0+`

## API

### Composables

#### `useForm`

Creates form context to be used in components.

### Components

### Types

#### `FormContext`

Context returned by `useForm` composable.

#### `Paths`

Helper type to get all available paths in the object.

Example:

```typescript
const a = { foo: { bar: 1 } }
type T = Paths<typeof a>
//   ^? type T = 'foo' | 'foo.bar'
```

#### `Get`

Helper type to get a type of nested property in the object.

Example:
```typescript
const a = { foo: { bar: 1 } }
type T = Get<typeof a, 'foo.bar'>
//   ^? type T = number
```
