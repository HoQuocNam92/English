/** Preserve database labels in their original language. */
export const levelLabel = (value: string) => value;
export const domainLabel = (value: string) => value;
export function localizeDisplayFields<T>(value: T): T { return value; }
export function localizeApiDisplayFields<T>(value: T, _path: string): T { return value; }
