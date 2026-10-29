import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import type { ReactNode } from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { AccountPage } from './page'

vi.mock('@clerk/nextjs', () => ({
  UserProfile: ({ path: profilePath, routing }: { path?: string; routing?: string }) => (
    <div data-path={profilePath} data-routing={routing} data-testid="user-profile" />
  ),
}))

vi.mock('@/ui/templates/PagaMain', () => ({
  PageMain: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}))

vi.mock('@/ui/templates/PageHeader', () => ({
  PageHeader: ({ title }: { title: string }) => <h1>{title}</h1>,
}))

describe('AccountPage', () => {
  it('keeps Clerk account tabs on the account base path', () => {
    render(<AccountPage />)

    expect(screen.getByRole('heading', { name: 'Account' })).toBeInTheDocument()
    expect(screen.getByTestId('user-profile')).toHaveAttribute('data-path', '/secured/account')
    expect(screen.getByTestId('user-profile')).toHaveAttribute('data-routing', 'path')
  })

  it('serves account tabs from an optional catch-all route', () => {
    const pageDir = path.dirname(fileURLToPath(import.meta.url))

    expect(path.basename(pageDir)).toBe('[[...account]]')
    expect(existsSync(path.join(pageDir, 'page.tsx'))).toBe(true)
    expect(existsSync(path.join(pageDir, '..', 'page.tsx'))).toBe(false)
  })
})
