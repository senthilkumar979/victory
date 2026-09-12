import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { afterEach, describe, expect, it, vi } from 'vitest'

import type { SubmissionFormValues } from '@/lib/assignments/assignmentSchemas'

import { SubmissionFormFields } from './SubmissionFormFields'

vi.mock('@/components/assignments/GoogleDocPreview', () => ({
  GoogleDocPreview: function GoogleDocPreviewMock({ url }: { url: string }) {
    return <div>Doc preview {url}</div>
  },
}))

vi.mock('@/components/assignments/GitHubRepoPreview', () => ({
  GitHubRepoPreview: function GitHubRepoPreviewMock({
    repoUrl,
  }: {
    repoUrl: string
  }) {
    return <div>Repo preview {repoUrl}</div>
  },
}))

function Harness({
  readOnly = false,
  rootMessage,
  defaults,
}: {
  readOnly?: boolean
  rootMessage?: string
  defaults?: Partial<SubmissionFormValues>
}) {
  const form = useForm<SubmissionFormValues>({
    defaultValues: {
      googleDocUrl: '',
      githubRepoUrl: '',
      ...defaults,
    },
  })

  useEffect(() => {
    if (rootMessage) form.setError('root', { message: rootMessage })
  }, [form, rootMessage])

  return (
    <SubmissionFormFields
      formId="submission-form"
      form={form}
      readOnly={readOnly}
    />
  )
}

afterEach(() => {
  cleanup()
})

describe('SubmissionFormFields', () => {
  it('shows previews only after valid Google Doc and GitHub URLs are entered', async () => {
    const user = userEvent.setup()
    render(<Harness />)

    await user.type(
      screen.getByPlaceholderText('https://docs.google.com/document/d/...'),
      'https://example.com/not-a-doc',
    )
    await user.type(
      screen.getByPlaceholderText('https://github.com/owner/repo'),
      'https://gitlab.com/owner/repo',
    )

    expect(screen.queryByText(/Doc preview/)).not.toBeInTheDocument()
    expect(screen.queryByText(/Repo preview/)).not.toBeInTheDocument()

    cleanup()
    render(
      <Harness
        defaults={{
          googleDocUrl: 'https://docs.google.com/document/d/abc123',
          githubRepoUrl: 'https://github.com/owner/repo',
        }}
      />,
    )

    expect(
      screen.getByText('Doc preview https://docs.google.com/document/d/abc123'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Repo preview https://github.com/owner/repo'),
    ).toBeInTheDocument()
  })

  it('disables both URL fields in read-only mode and shows a root error', () => {
    render(
      <Harness readOnly rootMessage="Provide at least one URL — Google Doc or GitHub repository" />,
    )

    expect(
      screen.getByPlaceholderText('https://docs.google.com/document/d/...'),
    ).toBeDisabled()
    expect(
      screen.getByPlaceholderText('https://github.com/owner/repo'),
    ).toBeDisabled()
    expect(
      screen.getByText(
        'Provide at least one URL — Google Doc or GitHub repository',
      ),
    ).toBeInTheDocument()
  })
})
