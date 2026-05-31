import { describe, bench, afterAll } from 'vitest';
import { effectScope, type EffectScope } from 'vue';
import { useForm } from 'varden';
import { useForm as useVV4Form } from 'vee-validate4';
import { useForm as useVV5Form } from 'vee-validate5';
import { toTypedSchema } from '@vee-validate/valibot';

import {
  logInSchema,
} from './schemas';

const logInVvSchema = toTypedSchema(logInSchema);

describe('setValue — logInSchema', () => {
  const username = 'johndoe@example.com';
  const userNameInput: Array<string> = [];
  for (let i = 1; i < username.length; i += 1) {
    userNameInput.push(username[i].substring(0, i));
  }

  const password = 'password123';
  const passwordInput: Array<string> = [];
  for (let i = 1; i < password.length; i += 1) {
    passwordInput.push(password[i].substring(0, i));
  }

  const { warn } = console;
  // eslint-disable-next-line no-console
  console.warn = () => {};

  const vardenScope: EffectScope = effectScope();
  const vardenForm = vardenScope.run(() => useForm({ schema: logInSchema, onSubmit() {} }))!;

  const vv4Scope: EffectScope = effectScope();
  const vv4Ctx = vv4Scope.run(() => useVV4Form({ validationSchema: logInVvSchema }))!;

  const vv5Scope: EffectScope = effectScope();
  const vv5Ctx = vv5Scope.run(() => useVV5Form({ validationSchema: logInSchema }))!;

  afterAll(() => {
    vardenScope.stop();
    vv4Scope.stop();
    vv5Scope.stop();
    // eslint-disable-next-line no-console
    console.warn = warn;
  });

  bench('varden', () => {
    for (const v of userNameInput) {
      vardenForm.setValue(['username'], v);
    }
    for (const v of passwordInput) {
      vardenForm.setValue(['password'], v);
    }
  });

  bench('vee-validate@4', () => {
    for (const v of userNameInput) {
      vv4Ctx.setFieldValue('username', v);
    }
    for (const v of passwordInput) {
      vv4Ctx.setFieldValue('password', v);
    }
  });

  bench('vee-validate@5', () => {
    for (const v of userNameInput) {
      vv5Ctx.setFieldValue('username', v);
    }
    for (const v of passwordInput) {
      vv5Ctx.setFieldValue('password', v);
    }
  });
});
