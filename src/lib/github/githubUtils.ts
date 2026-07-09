export interface ParsedGitHubRepo {
  owner: string
  repo: string
}

export function parseGitHubRepoUrl(url: string): ParsedGitHubRepo | null {
  try {
    const parsed = new URL(url.trim())
    if (!parsed.hostname.replace('www.', '').includes('github.com')) return null
    const parts = parsed.pathname.split('/').filter(Boolean)
    if (parts.length < 2) return null
    return { owner: parts[0], repo: parts[1].replace(/\.git$/, '') }
  } catch {
    return null
  }
}

export const MONACO_EXTENSIONS = new Set([
  'ts',
  'tsx',
  'js',
  'jsx',
  'json',
  'md',
  'css',
  'scss',
  'html',
])

export function getMonacoLanguage(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase() ?? ''
  const map: Record<string, string> = {
    ts: 'typescript',
    tsx: 'typescript',
    js: 'javascript',
    jsx: 'javascript',
    json: 'json',
    md: 'markdown',
    css: 'css',
    scss: 'scss',
    html: 'html',
  }
  return map[ext] ?? 'plaintext'
}

export function isSupportedMonacoPath(path: string): boolean {
  const ext = path.split('.').pop()?.toLowerCase() ?? ''
  return MONACO_EXTENSIONS.has(ext)
}
