import {
  computed,
  reactive,
  ref,
  toRaw,
  readonly,
  type ComputedRef,
  type Reactive,
  type Ref,
  type DeepReadonly,
  type WritableComputedRef,
  onScopeDispose,
  type MaybeRefOrGetter,
  watch,
  toValue,
} from 'vue';

import { getIssuePath, type StandardSchemaV1 } from './standard-schema';
import {
  type Paths, type Get, get, set, del, toCompiledPath,
  Empty,
  isEmptyObject,
} from './path';

type PartialDeep<T> = T extends object ? { [K in keyof T]?: PartialDeep<T[K]> } : Partial<T>;

interface FormProps<T> {
  schema: StandardSchemaV1<T>;
  initial?: PartialDeep<T>;
  onSubmit: (value: T) => Promise<void> | void;
  cloner?: <A>(arg: A) => A;
}

interface FieldMeta {
  touched: boolean;
  dirty: boolean;
  error: string;
  refCount: number;
  manual?: true;
}

export interface FormContext<T> {
  values: DeepReadonly<Ref<PartialDeep<T>>>;
  dirty: ComputedRef<boolean>;
  reset(): void;
  resetField<Path extends Paths<T>>(path: Path): void;
  setValue<Path extends Paths<T>, Value extends Get<T, Path>>(path: Path, value: Value): void;
  getValue<Path extends Paths<T>, Value extends Get<T, Path>>(path: Path): Value;
  setTouched<Path extends Paths<T>>(path: Path, flag?: boolean): void;
  valid: Ref<boolean>;
  meta: Reactive<Map<Paths<T>, FieldMeta>>;
  submit(): void;
  useFieldValue<P extends Paths<T>, V extends Get<T, P>>(
    path: MaybeRefOrGetter<P>,
  ): WritableComputedRef<V>;
  useFieldTouch<P extends Paths<T>>(path: P): (flag?: boolean | FocusEvent) => void;
  useFieldError<P extends Paths<T>>(path: P): ComputedRef<string>;
  useField<P extends Paths<T>, V extends Get<T, P>>(
    path: P,
  ): [WritableComputedRef<V>, (flag?: boolean | FocusEvent) => void, ComputedRef<string>];
  useArrayFieldValue<P extends Paths<T>, V extends Get<T, P>>(path: P): WritableComputedRef<V>;
  useArrayField<P extends Paths<T>, V extends Get<T, P>>(path: P): [WritableComputedRef<V>];
}

export function useForm<T = object>(props: FormProps<T>): FormContext<T> {
  const {
    initial, schema, onSubmit, cloner = structuredClone,
  } = props;

  const initialValues: PartialDeep<T> = cloner(initial ?? {} as PartialDeep<T>);

  const currentValues = ref<PartialDeep<T>>(cloner(initialValues));
  const fields = reactive(new Map<string, FieldMeta>());
  const valid = ref(true);

  applyValidation();

  const reset: FormContext<T>['reset'] = () => {
    currentValues.value = cloner(initialValues);
    applyValidation();

    for (const [, meta] of fields) {
      meta.touched = false;
    }
  };

  const resetField: FormContext<T>['resetField'] = (path) => {
    const cPath = toCompiledPath(path);

    const value = get(initialValues, cPath, Empty);
    if (value !== Empty) {
      set(currentValues.value, cPath, cloner(value));
    } else {
      del(currentValues.value, cPath);
      for (let depth = cPath.length - 2; depth >= 0; depth -= 1) {
        const val = get(currentValues.value, cPath, Empty, depth);
        if (val !== Empty && isEmptyObject(val)) {
          del(currentValues.value, cPath, depth);
        }
      }
    }

    // cleanup self
    const meta = fields.get(path);
    if (meta !== undefined) {
      if (meta.refCount === 0) {
        fields.delete(path);
      } else {
        meta.dirty = false;
        meta.touched = false;
      }
    }

    // cleanup child fields
    for (const [nestedPath, nestedMeta] of fields) {
      if (nestedPath.startsWith(`${path}.`)) {
        if (nestedMeta !== undefined) {
          if (nestedMeta.refCount === 0) {
            fields.delete(nestedPath);
          } else {
            nestedMeta.dirty = false;
            nestedMeta.touched = false;
          }
        }
      }
    }
  };

  async function applyValidation() {
    const result = await schema['~standard'].validate(currentValues.value);

    const issues = [...(result.issues ?? [])];
    const paths = issues.map(getIssuePath);

    valid.value = issues.length === 0;

    for (const [field, meta] of fields) {
      const index = paths.indexOf(field);
      if (index === -1) {
        meta.error = '';
        // eslint-disable-next-line no-continue
        continue;
      }

      meta.error = issues[index]!.message;

      issues.splice(index, 1);
      paths.splice(index, 1);
    }
    if (!issues.length) {
      return;
    }

    // proceed with unregistered paths
    for (let index = 0; index < paths.length; index += 1) {
      const path = paths[index]!;
      const error = issues[index]!.message;

      const meta = {
        touched: false,
        dirty: false,
        error,
        refCount: 0,
      };
      fields.set(path, meta);
    }
  }

  function releaseField(path: string) {
    const meta = fields.get(path);
    if (meta !== undefined) {
      meta.refCount -= 1;
      if (meta.refCount === 0) {
        fields.delete(path);
        resetField(path as Paths<T>);
      }
    }
  }

  function accquireField(path: string) {
    const meta = fields.get(path);
    if (meta !== undefined) {
      meta.refCount += 1;
      return;
    }

    fields.set(path, {
      touched: false,
      dirty: false,
      error: '',
      refCount: 1,
    });
  }

  const useFieldValue: FormContext<T>['useFieldValue'] = (fieldPath) => {
    const compiledPath = computed(() => toCompiledPath(toValue(fieldPath)));

    let path: typeof fieldPath;
    let meta: FieldMeta;

    watch(() => toValue(fieldPath), (currentPath, previousPath) => {
      if (previousPath) releaseField(previousPath);
      accquireField(currentPath);

      meta = fields.get(currentPath)!;
      path = currentPath;
    }, { immediate: true });

    onScopeDispose(() => {
      if (!path) return;
      releaseField(toValue(path));
    }, true);

    return computed({
      get: () => get(currentValues.value, compiledPath.value),
      set(value) {
        set(currentValues.value, compiledPath.value, cloner(value));

        meta.dirty = get(initialValues, compiledPath.value) !== value;
        applyValidation();
      },
    });
  };

  const useFieldTouch: FormContext<T>['useFieldTouch'] = (path) => (flag?: boolean | FocusEvent) => {
    fields.get(path)!.touched = flag instanceof FocusEvent ? true : (flag ?? true);
  };

  const useFieldError: FormContext<T>['useFieldError'] = (path) => computed<string>(() => {
    const meta = fields.get(path)!;
    if (meta.touched) {
      return meta.error;
    }
    return '';
  });

  const useField: FormContext<T>['useField'] = (path) => [
    useFieldValue(path),
    useFieldTouch(path),
    useFieldError(path),
  ];

  const useArrayFieldValue: FormContext<T>['useArrayFieldValue'] = (path) => {
    const compiledPath = toCompiledPath(path);
    let meta = fields.get(path);
    if (meta === undefined) {
      meta = {
        touched: false, dirty: false, error: '', refCount: 1,
      };
      fields.set(path, meta);
    } else {
      meta.refCount += 1;
    }

    return computed({
      get: () => get(currentValues.value, compiledPath) ?? [],
      set(value) {
        if (!Array.isArray(value)) {
          throw new Error(`Array expected, got ${typeof value}`);
        }
        set(currentValues.value, compiledPath, value);

        meta.dirty = get(initialValues, compiledPath) !== value;
        applyValidation();
      },
    });
  };

  const useArrayField: FormContext<T>['useArrayField'] = (path) => [useArrayFieldValue(path)];

  const dirty: FormContext<T>['dirty'] = computed<boolean>(() => {
    for (const [, meta] of fields) {
      if (meta.dirty === true) {
        return true;
      }
    }
    return false;
  });

  return {
    values: readonly(currentValues) as FormContext<T>['values'],
    dirty,
    meta: fields as FormContext<T>['meta'],
    reset,
    resetField,
    setValue<Path extends Paths<T>, Value extends Get<T, Path>>(path: Path, value: Value) {
      set(currentValues.value, toCompiledPath(path), value);

      const meta = fields.get(path);
      if (meta) {
        meta.dirty = get(initialValues, toCompiledPath(path)) !== value;
      } else {
        fields.set(path, {
          dirty: true, touched: false, error: '', refCount: 0, manual: true,
        });
      }
      applyValidation();
    },
    getValue<Path extends Paths<T>, Value extends Get<T, Path>>(path: Path): Value {
      return get(currentValues.value, toCompiledPath(path));
    },
    setTouched<Path extends Paths<T>>(path: Path, flag = true) {
      fields.get(path)!.touched = flag;
    },
    valid,
    submit() {
      if (!valid.value) {
        for (const [, meta] of fields) {
          meta.touched = true;
        }
        return;
      }

      onSubmit(cloner(toRaw(currentValues.value)));
    },
    useField,
    useFieldValue,
    useFieldTouch,
    useFieldError,
    useArrayFieldValue,
    useArrayField,
  };
}
