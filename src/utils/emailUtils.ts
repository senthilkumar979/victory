const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function parseEmails(text: string): string[] {
  const raw = text
    .split(/[\n,\t;]+/)
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
  const seen = new Set<string>()
  return raw.filter((e) => EMAIL_REGEX.test(e) && !seen.has(e) && seen.add(e))
}
