import { cleanup, render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { formatDueDate } from '@/lib/assignments/assignmentUtils'
import type { AssignmentSubmission } from '@/types/assignment.types'

import AdminSubmissionViewPage from './page'

const { authMock, fetchMock } = vi.hoisted(() => ({
  authMock: vi.fn(),
  fetchMock: vi.fn(),
}))

vi.mock('@/hooks/useCheckIsAuthenticated', () => ({
  useCheckIsAuthenticated: () => authMock(),
}))

vi.mock('next/link', () => ({
  default: function NextLink({
    href,
    children,
    ...props
  }: {
    href: string
    children: ReactNode
  }) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    )
  },
}))

vi.mock('@/components/assignments/GoogleDocPreview', () => ({
  GoogleDocPreview: function GoogleDocPreview({ url }: { url: string }) {
    return <div data-testid="google-doc" data-url={url} />
  },
}))

vi.mock('@/components/assignments/GitHubRepoPreview', () => ({
  GitHubRepoPreview: function GitHubRepoPreview({ repoUrl }: { repoUrl: string }) {
    return <div data-testid="github-repo" data-url={repoUrl} />
  },
}))

vi.mock('@/components/assignments/SubmissionFeedbackForm', () => ({
  SubmissionFeedbackForm: function SubmissionFeedbackForm({
    submission,
  }: {
    submission: AssignmentSubmission
  }) {
    return <div data-testid="feedback" data-id={submission.id} />
  },
}))

const submission = {
  id: 'sub-1',
  assignmentId: 'asg-1',
  studentId: 'stu-1',
  studentName: 'Ada Lovelace',
  googleDocUrl: 'https://docs.google.com/document/d/abc',
  githubRepoUrl: 'https://github.com/ada/repo',
  submittedAt: '2026-07-10T12:00:00.000Z',
  updatedAt: '2026-07-11T12:00:00.000Z',
  rating: null,
  feedbackComment: null,
  reviewedBy: null,
  reviewedAt: null,
} satisfies AssignmentSubmission

function fulfilledParams() {
  const value = { id: 'asg-1', submissionId: 'sub-1' }
  const params = Promise.resolve(value) as Promise<typeof value> & {
    status: 'fulfilled'
    value: typeof value
  }
  params.status = 'fulfilled'
  params.value = value
  return params
}

function renderPage() {
  return render(<AdminSubmissionViewPage params={fulfilledParams()} />)
}

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('AdminSubmissionViewPage', () => {
  it('loads a submission and skips empty previews', async () => {
    vi.stubGlobal('fetch', fetchMock)
    fetchMock.mockResolvedValue({
      json: async () => ({
        submission: {
          ...submission,
          studentName: undefined,
          googleDocUrl: '',
          githubRepoUrl: '',
        },
      }),
    })

    renderPage()

    expect(authMock).toHaveBeenCalled()
    expect(screen.getByText('Loading submission...')).toBeInTheDocument()

    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent(
      'Student submission',
    )
    expect(
      screen.getByText(`Updated ${formatDueDate(submission.updatedAt)}`),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Back to assignment/ })).toHaveAttribute(
      'href',
      '/secured/assignments/asg-1',
    )
    expect(screen.queryByTestId('google-doc')).not.toBeInTheDocument()
    expect(screen.queryByTestId('github-repo')).not.toBeInTheDocument()
    expect(screen.getByTestId('feedback')).toHaveAttribute('data-id', 'sub-1')
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/assignments/asg-1/submissions/sub-1',
    )
  })

  it('shows doc and repo previews only when urls are present', async () => {
    vi.stubGlobal('fetch', fetchMock)
    fetchMock.mockResolvedValue({
      json: async () => ({ submission }),
    })

    renderPage()

    expect(await screen.findByRole('heading', { name: 'Ada Lovelace submission' })).toBeInTheDocument()
    expect(screen.getByTestId('google-doc')).toHaveAttribute(
      'data-url',
      submission.googleDocUrl,
    )
    expect(screen.getByTestId('github-repo')).toHaveAttribute(
      'data-url',
      submission.githubRepoUrl,
    )
  })

  it('shows the API error and a generic message when the failure is not an Error', async () => {
    vi.stubGlobal('fetch', fetchMock)
    fetchMock.mockResolvedValueOnce({
      json: async () => ({ error: 'Forbidden' }),
    })

    const { unmount } = renderPage()
    expect(await screen.findByText('Forbidden')).toBeInTheDocument()
    expect(screen.queryByTestId('feedback')).not.toBeInTheDocument()
    unmount()

    fetchMock.mockRejectedValueOnce('offline')
    renderPage()
    expect(await screen.findByText('Failed to load')).toBeInTheDocument()
  })
})
