export type Result<TValue, TError> =
  | { ok: true; value: TValue }
  | { ok: false; error: TError };

export const success = <TValue>(value: TValue): Result<TValue, never> => ({
  ok: true,
  value
});

export const failure = <TError>(error: TError): Result<never, TError> => ({
  ok: false,
  error
});
