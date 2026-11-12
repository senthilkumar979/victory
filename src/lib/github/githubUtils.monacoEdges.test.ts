import { describe, expect, it } from 'vitest'

import { getMonacoLanguage, isSupportedMonacoPath } from './githubUtils'

describe('Monaco extension edges', () => {
  it.each([
    ['app.js', 'javascript', true],
    ['App.JSX', 'javascript', true],
    ['data.JSON', 'json', true],
    ['styles.CSS', 'css', true],
    ['theme.scss', 'scss', true],
    ['index.HTML', 'html', true],
    ['src/file.test.ts', 'typescript', true],
    ['README', 'plaintext', false],
    ['archive.tar.gz', 'plaintext', false],
    ['notes.', 'plaintext', false],
  ] as const)(
    '%s maps to %s and supported=%s',
    (path, language, supported) => {
      expect(getMonacoLanguage(path)).toBe(language)
      expect(isSupportedMonacoPath(path)).toBe(supported)
    },
  )
})
