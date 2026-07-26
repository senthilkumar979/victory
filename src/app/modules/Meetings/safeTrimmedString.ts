/** Returns a trimmed string when value is a non-empty string; otherwise undefined. */
export function safeTrimmedString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}
