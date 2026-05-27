export interface FieldMeta {
  touched: boolean;
  dirty: boolean;
  error: string | null;
  refCount: number;
}

export function createFieldMeta(
  touched: boolean,
  dirty: boolean,
  error: string | null,
  refCount: number,
): FieldMeta {
  return {
    touched,
    dirty,
    error,
    refCount,
  };
}
