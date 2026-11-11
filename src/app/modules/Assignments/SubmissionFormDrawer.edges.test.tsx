import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ReactNode } from 'react'

import type { AssignmentSubmission } from '@/types/assignment.types'

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

const REQUIREMENT =
  'Provide at least one URL — Google Doc or GitHub repository'
const GITHUB_PLACEHOLDER = 'https://github.com/owner/repo'
const DOC_URL = 'https://docs.google.com/document/d/abcXYZ-123/edit'
const REPO_URL = 'https://github.com/ada/lab'

const savedSubmission: AssignmentSubmission = {
  id: 'sub-1',
  assignmentId: 'asg-1',
  studentId: 'stu-1',
  googleDocUrl: DOC_URL,
  githubRepoUrl: REPO_URL,
  submittedAt: '2026-07-01T00:00:00.000Z',
  updatedAt: '2026-07-01T00:00:00.000Z',
  rating: null,
  feedbackComment: null,
  reviewedBy: null,
  reviewedAt: null,
}

afterEach(() => {
  cleanup()
})

describe('SubmissionFormDrawer edges', () => {
  beforeEach(() => {
    successMock.mockReset()
    errorMock.mockReset()
    vi.unstubAllGlobals()
  })

  it('keeps an edited submission in sync after the drawer reset', async () => {
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
        submission={savedSubmission}
        onClose={vi.fn()}
        onSuccess={onSuccess}
      />,
    )

    expect(
      screen.getByRole('heading', { name: 'Edit submission' }),
    ).toBeInTheDocument()

    const repoInput = screen.getByPlaceholderText(GITHUB_PLACEHOLDER)
    await waitFor(() => {
      expect(repoInput).toHaveValue(REPO_URL)
    })
    expect(screen.getByPlaceholderText(/docs.google.com/)).toHaveValue(DOC_URL)
    expect(screen.getByText('doc-preview')).toBeInTheDocument()
    expect(screen.getByText('repo-preview')).toBeInTheDocument()

    await user.clear(repoInput)
    await user.type(repoInput, 'https://github.com/ada/updated')
    await user.click(screen.getByRole('button', { name: /Save/ }))

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/assignments/asg-1/my-submission',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            googleDocUrl: DOC_URL,
            githubRepoUrl: 'https://github.com/ada/updated',
          }),
        }),
      )
    })
    expect(onSuccess).toHaveBeenCalled()
  })

  it('uses a generic description when a failed save omits error text', async () => {
    const user = userEvent.setup()
    const onSuccess = vi.fn()
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({}),
      }),
    )

    render(
      <SubmissionFormDrawer
        isOpen
        assignmentId="asg-1"
        onClose={vi.fn()}
        onSuccess={onSuccess}
      />,
    )

    await user.type(
      screen.getByPlaceholderText(GITHUB_PLACEHOLDER),
      REPO_URL,
    )
    await user.click(screen.getByRole('button', { name: /Save/ }))

    await waitFor(() => {
      expect(errorMock).toHaveBeenCalledWith('Failed to save submission.', {
        description: 'Failed to save submission',
      })
    })
    expect(onSuccess).not.toHaveBeenCalled()
  })

  it('uses the fallback description when save rejects with a non-Error', async () => {
    const user = userEvent.setup()
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue('offline'))

    render(
      <SubmissionFormDrawer
        isOpen
        assignmentId="asg-1"
        onClose={vi.fn()}
        onSuccess={vi.fn()}
      />,
    )

    await user.type(
      screen.getByPlaceholderText(GITHUB_PLACEHOLDER),
      REPO_URL,
    )
    await user.click(screen.getByRole('button', { name: /Save/ }))

    await waitFor(() => {
      expect(errorMock).toHaveBeenCalledWith('Failed to save submission.', {
        description: 'Please try again.',
      })
    })
  })

  it('treats whitespace-only links as missing and blocks the request', async () => {
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

    await user.type(screen.getByPlaceholderText(GITHUB_PLACEHOLDER), '   ')
    await user.type(screen.getByPlaceholderText(/docs.google.com/), '   ')
    await user.click(screen.getByRole('button', { name: /Save/ }))

    expect(await screen.findByText(REQUIREMENT)).toBeInTheDocument()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('clears the requirement error once a link is entered', async () => {
    const user = userEvent.setup()
    vi.stubGlobal('fetch', vi.fn())

    render(
      <SubmissionFormDrawer
        isOpen
        assignmentId="asg-1"
        onClose={vi.fn()}
        onSuccess={vi.fn()}
      />,
    )

    await user.click(screen.getByRole('button', { name: /Save/ }))
    expect(await screen.findByText(REQUIREMENT)).toBeInTheDocument()

    await user.type(screen.getByPlaceholderText(GITHUB_PLACEHOLDER), 'x')

    await waitFor(() => {
      expect(screen.queryByText(REQUIREMENT)).not.toBeInTheDocument()
    })
  })

  it('blocks an invalid repository URL before calling the API', async () => {
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

    await user.type(
      screen.getByPlaceholderText(GITHUB_PLACEHOLDER),
      'https://gitlab.com/ada/lab',
    )
    await user.click(screen.getByRole('button', { name: /Save/ }))

    expect(
      await screen.findByText(
        'Enter a valid GitHub repository URL (github.com/owner/repo)',
      ),
    ).toBeInTheDocument()
    expect(fetchMock).not.toHaveBeenCalled()
    expect(screen.queryByText(REQUIREMENT)).not.toBeInTheDocument()
  })
})
