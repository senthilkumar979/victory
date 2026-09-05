import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ReactNode } from 'react'

const { successMock, errorMock } = vi.hoisted(() => ({
  successMock: vi.fn(),
  errorMock: vi.fn(),
}))

vi.mock('goey-toast', () => ({
  gooeyToast: {
    success: (...args: unknown[]) => successMock(...args),
    error: (...args: unknown[]) => errorMock(...args),
  },
}))

vi.mock('@/ui/organisms/drawer/Drawer', () => {
  const Drawer = ({
    isOpen,
    children,
  }: {
    isOpen: boolean
    children: ReactNode
  }) => (isOpen ? <div role="dialog">{children}</div> : null)
  function Title({
    children,
    description,
  }: {
    children: ReactNode
    description?: ReactNode
  }) {
    return (
      <header>
        <h2>{children}</h2>
        {description ? <p>{description}</p> : null}
      </header>
    )
  }
  function Body({ children }: { children: ReactNode }) {
    return <div>{children}</div>
  }
  function Footer({ children }: { children: ReactNode }) {
    return <div>{children}</div>
  }
  Drawer.Title = Title
  Drawer.Body = Body
  Drawer.Footer = Footer
  return { Drawer }
})

vi.mock('@/components/assignments/GoogleDocPreview', () => ({
  GoogleDocPreview: () => <div>doc-preview</div>,
}))

vi.mock('@/components/assignments/GitHubRepoPreview', () => ({
  GitHubRepoPreview: () => <div>repo-preview</div>,
}))

import { SubmissionFormDrawer } from './SubmissionFormDrawer'

afterEach(() => {
  cleanup()
})

describe('SubmissionFormDrawer', () => {
  beforeEach(() => {
    successMock.mockReset()
    errorMock.mockReset()
    vi.unstubAllGlobals()
  })

  it('blocks empty submissions and does not call the API', async () => {
    const user = userEvent.setup()
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    render(
      <SubmissionFormDrawer
        isOpen
        assignmentId="asg-1"
        onClose={vi.fn()}
        onSuccess={vi.fn()}
      />,
    )

    await user.click(screen.getByRole('button', { name: /Save/ }))

    expect(
      await screen.findByText(
        'Provide at least one URL — Google Doc or GitHub repository',
      ),
    ).toBeInTheDocument()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('posts a valid GitHub repo and notifies success', async () => {
    const user = userEvent.setup()
    const onSuccess = vi.fn()
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ submission: { id: 'sub-1' } }),
    })
    vi.stubGlobal('fetch', fetchMock)

    render(
      <SubmissionFormDrawer
        isOpen
        assignmentId="asg-1"
        onClose={vi.fn()}
        onSuccess={onSuccess}
      />,
    )

    await user.type(
      screen.getByPlaceholderText('https://github.com/owner/repo'),
      'https://github.com/ada/lab',
    )
    await user.click(screen.getByRole('button', { name: /Save/ }))

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/assignments/asg-1/my-submission',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            googleDocUrl: '',
            githubRepoUrl: 'https://github.com/ada/lab',
          }),
        }),
      )
    })
    expect(successMock).toHaveBeenCalled()
    expect(onSuccess).toHaveBeenCalled()
  })

  it('uses the API error string, then a fallback, when save fails', async () => {
    const user = userEvent.setup()
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Past due' }),
    })
    vi.stubGlobal('fetch', fetchMock)

    render(
      <SubmissionFormDrawer
        isOpen
        assignmentId="asg-1"
        onClose={vi.fn()}
        onSuccess={vi.fn()}
      />,
    )

    await user.type(
      screen.getByPlaceholderText('https://github.com/owner/repo'),
      'https://github.com/ada/lab',
    )
    await user.click(screen.getByRole('button', { name: /Save/ }))

    await waitFor(() => {
      expect(errorMock).toHaveBeenCalledWith(
        'Failed to save submission.',
        expect.objectContaining({ description: 'Past due' }),
      )
    })
  })

  it('hides save and does not fetch when the deadline has passed', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    render(
      <SubmissionFormDrawer
        isOpen
        assignmentId="asg-1"
        readOnly
        onClose={vi.fn()}
        onSuccess={vi.fn()}
      />,
    )

    expect(screen.getByText('Submission deadline has passed.')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Save/ })).not.toBeInTheDocument()
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
