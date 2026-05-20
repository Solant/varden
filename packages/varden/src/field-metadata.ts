export interface FieldMeta {
  touched: boolean;
  dirty: boolean;
  error: string;
  refCount: number;
  manual?: true;
}

export function createFieldMeta(
  touched: boolean,
  dirty: boolean,
  error: string,
  refCount: number,
): FieldMeta {
  return {
    touched,
    dirty,
    error,
    refCount,
  };
}
