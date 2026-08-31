/**
 * Safely convert any API value to a renderable string.
 * API responses often return nested objects instead of plain strings.
 * Use this before rendering any field in a <Text> component.
 *
 * @example
 *   <Text>{safeText(lesson.domain, 'Unknown')}</Text>
 */
export function safeText(val: any, fallback = ''): string {
  if (val === null || val === undefined) return fallback;
  if (typeof val === 'string') return val || fallback;
  if (typeof val === 'number' || typeof val === 'boolean') return String(val);
  if (typeof val === 'object') {
    const resolved =
      val.text ?? val.name ?? val.title ?? val.content ?? val.value ?? val.label ?? val.description ?? null;
    if (resolved !== null && resolved !== undefined) {
      return safeText(resolved, fallback);
    }
    return fallback;
  }
  return fallback;
}
