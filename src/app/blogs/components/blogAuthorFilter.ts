export const MAX_AUTHOR_SUGGESTIONS = 10

export function filterAuthorsByPrefix(
  authors: string[],
  query: string,
): string[] {
  const q = query.trim().toLowerCase()
  if (!q) return []
  return authors
    .filter((name) => name.toLowerCase().startsWith(q))
    .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }))
    .slice(0, MAX_AUTHOR_SUGGESTIONS)
}
