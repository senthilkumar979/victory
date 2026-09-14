import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ComponentProps } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { MeetingFormCoverImageSection } from './MeetingFormCoverImageSection'

const uploadState = {
  uploadCoverImage: vi.fn(),
  isUploading: false,
  error: null as string | null,
}

vi.mock('./useMeetingCoverImageUpload', () => ({
  useMeetingCoverImageUpload: () => uploadState,
}))

const coverFile = new File(['cover-bytes'], 'cover.png', { type: 'image/png' })

function renderSection(
  overrides: Partial<
    ComponentProps<typeof MeetingFormCoverImageSection>
  > = {},
) {
  const props = {
    formId: 'meeting-form',
    coverImageUrl: '',
    onCoverImageUrlChange: vi.fn(),
    stagedCoverFile: null as File | null,
    onStagedCoverFileChange: vi.fn(),
    ...overrides,
  }
  render(<MeetingFormCoverImageSection {...props} />)
  return props
}

beforeEach(() => {
  uploadState.uploadCoverImage.mockReset()
  uploadState.isUploading = false
  uploadState.error = null
  vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:cover-preview')
  vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe('MeetingFormCoverImageSection', () => {
  it('stages a file on create without uploading', async () => {
    const user = userEvent.setup()
    const props = renderSection({ meetingId: undefined })

    await user.upload(screen.getByLabelText('Cover image'), coverFile)

    expect(props.onStagedCoverFileChange).toHaveBeenCalledWith(coverFile)
    expect(uploadState.uploadCoverImage).not.toHaveBeenCalled()
    expect(props.onCoverImageUrlChange).not.toHaveBeenCalled()
    expect(
      screen.getByText('Choose an image now — it uploads when you create the meeting.'),
    ).toBeInTheDocument()
  })

  it('treats whitespace meeting ids as create and skips upload', async () => {
    const user = userEvent.setup()
    const props = renderSection({ meetingId: '   ' })

    await user.upload(screen.getByLabelText('Cover image'), coverFile)

    expect(props.onStagedCoverFileChange).toHaveBeenCalledWith(coverFile)
    expect(uploadState.uploadCoverImage).not.toHaveBeenCalled()
  })

  it('uploads immediately when editing and clears the staged file on success', async () => {
    const user = userEvent.setup()
    uploadState.uploadCoverImage.mockResolvedValue('https://cdn.example/cover.webp')
    const props = renderSection({ meetingId: 'meet/123' })

    await user.upload(screen.getByLabelText('Cover image'), coverFile)

    await waitFor(() => {
      expect(uploadState.uploadCoverImage).toHaveBeenCalledWith('meet/123', coverFile)
    })
    expect(props.onCoverImageUrlChange).toHaveBeenCalledWith(
      'https://cdn.example/cover.webp',
    )
    expect(props.onStagedCoverFileChange).toHaveBeenLastCalledWith(null)
  })

  it('keeps the staged file when an edit upload fails', async () => {
    const user = userEvent.setup()
    uploadState.uploadCoverImage.mockResolvedValue(null)
    const props = renderSection({ meetingId: 'meet-1' })

    await user.upload(screen.getByLabelText('Cover image'), coverFile)

    await waitFor(() => {
      expect(uploadState.uploadCoverImage).toHaveBeenCalled()
    })
    expect(props.onCoverImageUrlChange).not.toHaveBeenCalled()
    expect(props.onStagedCoverFileChange).toHaveBeenCalledTimes(1)
    expect(props.onStagedCoverFileChange).toHaveBeenCalledWith(coverFile)
  })

  it('clears both staged file and saved URL from the preview control', async () => {
    const user = userEvent.setup()
    const props = renderSection({
      meetingId: 'meet-1',
      coverImageUrl: 'https://cdn.example/existing.png',
    })

    await user.click(screen.getByRole('button', { name: 'Remove cover image' }))

    expect(props.onStagedCoverFileChange).toHaveBeenCalledWith(null)
    expect(props.onCoverImageUrlChange).toHaveBeenCalledWith('')
  })

  it('does not treat a whitespace-only saved URL as a preview', () => {
    renderSection({ coverImageUrl: '   ' })

    expect(screen.queryByAltText('Cover preview')).not.toBeInTheDocument()
    expect(
      screen.getByRole('button', {
        name: /Choose cover image \(JPG, PNG, WebP\)/,
      }),
    ).toBeInTheDocument()
  })
})
