import { describe, bench } from 'vitest';
import { effectScope } from 'vue';
import { useForm } from 'varden';
import { useForm as useVV4Form } from 'vee-validate4';
import { useForm as useVV5Form } from 'vee-validate5';
import { toTypedSchema } from '@vee-validate/valibot';
import {
  logInSchema,
  // signUpSchema
} from './schemas';

const logInVvSchema = toTypedSchema(logInSchema);
// const signUpVvSchema = toTypedSchema(signUpSchema);

const username = 'johndoe@example.com';
const userNameInput: Array<string> = [];
for (let i = 1; i < username.length; i++) {
  userNameInput.push(username[i].substring(0, i));
}

const password = 'password123';
const passwordInput: Array<string> = [];
for (let i = 1; i < password.length; i++) {
  passwordInput.push(password[i].substring(0, i));
}

describe('setValue — logInSchema', () => {
  bench('varden', () => {
    const scope = effectScope();
    const form = scope.run(() =>
      useForm({ schema: logInSchema, onSubmit() {} }),
    )!;
    for (const v of userNameInput) {
      form.setValue(['username'], v);
    }
    for (const v of passwordInput) {
      form.setValue(['password'], v);
    }
    scope.stop();
  });

  bench('vee-validate@4', () => {
    const scope = effectScope();
    const ctx = scope.run(() =>
      useVV4Form({ validationSchema: logInVvSchema }),
    )!;
    for (const v of userNameInput) {
      ctx.setFieldValue('username', v);
    }
    for (const v of passwordInput) {
      ctx.setFieldValue('password', v);
    }
    scope.stop();
  });

  bench('vee-validate@5', () => {
    const scope = effectScope();
    const ctx = scope.run(() =>
      useVV5Form({ validationSchema: logInSchema }),
    )!;
    for (const v of userNameInput) {
      ctx.setFieldValue('username', v);
    }
    for (const v of passwordInput) {
      ctx.setFieldValue('password', v);
    }
    scope.stop();
  });
});
