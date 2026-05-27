import {
  computed,
  reactive,
  ref,
  readonly,
  type ComputedRef,
  type Ref,
  type DeepReadonly,
} from 'vue';

import { getIssuePath, type StandardSchemaV1 } from './standard-schema';
import {
  type Paths, type Get, get, set, del, toCompiledPath,
  Empty,
  isEmptyObject,
  type CompiledPath,
} from './path';
import { createFieldMeta, type FieldMeta } from './field-metadata';

type PartialDeep<T> = T extends object ? { [K in keyof T]?: PartialDeep<T[K]> } : Partial<T>;

interface FormProps<T> {
  schema: StandardSchemaV1<T>;
  initial?: PartialDeep<T>;
  onSubmit: (value: T) => Promise<void> | void;
  cloneFn?: <A>(arg: A) => A;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  equalsFn?: (a: any, b: any) => boolean;
}

export interface FormContext<T> {
  values: DeepReadonly<Ref<PartialDeep<T>>>;
  dirty: ComputedRef<boolean>;
  reset(): void;
  resetField<Path extends Paths<T>>(path: Path): void;
  setValue<Path extends Paths<T>, Value extends Get<T, Path>>(
    path: Path | CompiledPath,
    value: Value,
  ): void;
  getValue<Path extends Paths<T>, Value extends Get<T, Path>>(path: Path | CompiledPath): Value;
  setTouched<Path extends Paths<T>>(path: Path, flag?: boolean): void;
  isTouched<Path extends Paths<T>>(path: Path): boolean;
  valid: Ref<boolean>;
  isDirty<Path extends Paths<T>>(path: Path): boolean;
  getError<Path extends Paths<T>>(path: Path): string | null;
  submit(): void;
}

export interface _FormContext<T> extends FormContext<T> {
  __meta: Map<Paths<T>, FieldMeta>;
}

export function useForm<T = object>(props: FormProps<T>): FormContext<T> {
  const {
    initial, schema, onSubmit, cloneFn = structuredClone, equalsFn = (a, b) => a === b,
  } = props;

  const initialValues: PartialDeep<T> = cloneFn(initial ?? {} as PartialDeep<T>);

  const currentValues = ref<PartialDeep<T>>(cloneFn(initialValues));
  const fields = reactive(new Map<string, FieldMeta>());
  const valid = ref(true);

  applyValidation();

  const reset: FormContext<T>['reset'] = () => {
    currentValues.value = cloneFn(initialValues);
    for (const [path, meta] of fields) {
      if (meta.refCount === 0) {
        fields.delete(path);
      } else {
        meta.dirty = false;
        meta.touched = false;
      }
    }
    applyValidation();
  };

  const resetField: FormContext<T>['resetField'] = (path) => {
    const cPath = toCompiledPath(path);

    const value = get(initialValues, cPath, Empty);
    if (value !== Empty) {
      set(currentValues.value, cPath, cloneFn(value));
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

      fields.set(path, createFieldMeta(false, false, error, 0));
    }
  }

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
    // @ts-expect-error private field
    __meta: fields,
    reset,
    resetField,
    setValue<Path extends Paths<T>, Value extends Get<T, Path>>(
      path: Path | CompiledPath,
      value: Value,
    ) {
      const compiledPath = Array.isArray(path) ? path : toCompiledPath(path);
      const stringPath = typeof path === 'string' ? path : compiledPath.join('.');

      set(currentValues.value, compiledPath, cloneFn(value));

      const meta = fields.get(stringPath);
      const isDirty = !equalsFn(get(initialValues, compiledPath), value);
      if (meta) {
        meta.dirty = isDirty;
      } else {
        fields.set(stringPath, createFieldMeta(false, isDirty, '', 0));
      }
      applyValidation();
    },
    getValue<Path extends Paths<T>, Value extends Get<T, Path>>(path: Path | CompiledPath): Value {
      return get(currentValues.value, Array.isArray(path) ? path : toCompiledPath(path));
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

      // TODO: properly coerce/transform validation result
      onSubmit(cloneFn(currentValues.value));
    },
    isDirty<Path extends Paths<T>>(path: Path): boolean {
      return fields.get(path)?.dirty ?? false;
    },
    isTouched<Path extends Paths<T>>(path: Path): boolean {
      return fields.get(path)?.touched ?? false;
    },
    getError<Path extends Paths<T>>(path: Path): string | null {
      return fields.get(path)?.error ?? null;
    },
  };
}
