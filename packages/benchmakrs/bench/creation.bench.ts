import { describe, bench } from 'vitest';
import { effectScope, type EffectScope } from 'vue';
import { useForm } from 'varden';
import { useForm as useVV4Form } from 'vee-validate4';
import { useForm as useVV5Form } from 'vee-validate5';
import { toTypedSchema } from '@vee-validate/valibot';
import {
  logInSchema,
  signUpSchema
} from './schemas';

const logInVv4Schema = toTypedSchema(logInSchema);
const signUpVv4Schema = toTypedSchema(signUpSchema);

describe('form creation — logInSchema', () => {
  bench('varden', () => {
    const scope: EffectScope = effectScope();
    scope.run(() => {
      useForm({ schema: logInSchema, onSubmit() {} });
    });
    scope.stop();
  });

  bench('vee-validate@4', () => {
    const scope: EffectScope = effectScope();
    scope.run(() => {
      useVV4Form({ validationSchema: logInVv4Schema });
    });
    scope.stop();
  });

  bench('vee-validate@5', () => {
    const scope: EffectScope = effectScope();
    scope.run(() => {
      useVV5Form({ validationSchema: logInSchema });
    });
    scope.stop();
  });
});

describe('form creation — signUpSchema', () => {
  bench('varden', () => {
    const scope: EffectScope = effectScope();
    scope.run(() => {
      useForm({ schema: signUpSchema, onSubmit() {} });
    });
    scope.stop();
  });

  bench('vee-validate@4', () => {
    const scope: EffectScope = effectScope();
    scope.run(() => {
      useVV4Form({ validationSchema: signUpVv4Schema });
    });
    scope.stop();
  });

  bench('vee-validate@5', () => {
    const scope: EffectScope = effectScope();
    scope.run(() => {
      useVV5Form({ validationSchema: signUpSchema });
    });
    scope.stop();
  });
});
