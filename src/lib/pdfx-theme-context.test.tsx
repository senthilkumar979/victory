import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { theme as defaultTheme } from './pdfx-theme'
import { PdfxThemeProvider, usePdfxTheme, useSafeMemo } from './pdfx-theme-context'

const hookError = vi.hoisted(() => ({ message: '' }))

vi.mock('react', async () => {
  const actual = await vi.importActual<typeof import('react')>('react')
  return {
    ...actual,
    useContext: (context: unknown) => {
      if (hookError.message) throw new Error(hookError.message)
      return actual.useContext(context as never)
    },
  }
})

const Probe = () => {
  const theme = usePdfxTheme()
  const label = useSafeMemo(() => theme.name.toUpperCase(), [theme.name])
  return <p>{label}</p>
}

afterEach(() => {
  cleanup()
  hookError.message = ''
})

describe('pdfx theme context', () => {
  it('uses the provider theme and otherwise the default theme', () => {
    const { rerender } = render(
      <PdfxThemeProvider theme={{ ...defaultTheme, name: 'custom' }}>
        <Probe />
      </PdfxThemeProvider>,
    )
    expect(screen.getByText('CUSTOM')).toBeInTheDocument()

    rerender(<Probe />)
    expect(screen.getByText(defaultTheme.name.toUpperCase())).toBeInTheDocument()
  })

  it('returns the default theme for an invalid hook call and rethrows other errors', () => {
    hookError.message =
      'Invalid hook call. Hooks can only be called inside of the body of a function component.'
    expect(usePdfxTheme()).toBe(defaultTheme)

    hookError.message = 'theme store unavailable'
    expect(() => usePdfxTheme()).toThrow('theme store unavailable')
  })
})
