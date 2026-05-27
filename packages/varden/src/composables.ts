import {
  computed,
  onScopeDispose,
  toValue,
  watch,
  type ComputedRef,
  type MaybeRefOrGetter,
  type WritableComputedRef,
} from 'vue';

import type { _FormContext, FormContext } from './lib';
import {
  toCompiledPath,
  type Get, type Paths,
} from './path';
import { createFieldMeta } from './field-metadata';

function releaseField<T, Path extends Paths<T>>(form: FormContext<T>, path: Path) {
  const meta = (form as _FormContext<T>).__meta.get(path);
  if (meta !== undefined) {
    meta.refCount -= 1;
    if (meta.refCount === 0) {
      form.resetField(path);
    }
  }
}

function acquireField<T, Path extends Paths<T>>(form: FormContext<T>, path: Path) {
  const meta = (form as _FormContext<T>).__meta.get(path);
  if (meta !== undefined) {
    meta.refCount += 1;
    return;
  }

  (form as _FormContext<T>).__meta.set(path, createFieldMeta(false, false, '', 1));
}

export function useFieldDirty<T, Path extends Paths<T>>(
  form: FormContext<T>,
  path: MaybeRefOrGetter<Path>,
): ComputedRef<boolean> {
  return computed(() => form.isDirty(toValue(path)));
}

export function useFieldTouched<T, Path extends Paths<T>>(
  form: FormContext<T>,
  path: MaybeRefOrGetter<Path>,
): WritableComputedRef<boolean> {
  return computed({
    get: () => form.isTouched(toValue(path)),
    set: (value) => form.setTouched(toValue(path), value),
  });
}

export function useFieldValue<T>(
  form: FormContext<T>,
  path: MaybeRefOrGetter<Paths<T>>,
): ComputedRef<Get<T, Paths<T>>> {
  const compiledPath = computed(() => toCompiledPath(toValue(path)));

  watch(() => toValue(path), (currentPath, previousPath) => {
    if (previousPath) releaseField(form, previousPath);
    acquireField(form, currentPath);
  }, { immediate: true });

  onScopeDispose(() => {
    releaseField(form, toValue(path));
  }, true);

  return computed({
    get: () => form.getValue(compiledPath.value),
    set(value) {
      form.setValue(compiledPath.value, value);
    },
  });
}

export function useFieldError<T, Path extends Paths<T>>(
  form: FormContext<T>,
  path: MaybeRefOrGetter<Path>,
): ComputedRef<string | null> {
  return computed(() => form.getError(toValue(path)));
}
