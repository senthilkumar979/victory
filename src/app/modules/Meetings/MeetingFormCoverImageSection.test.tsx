import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { MeetingFormCoverImageSection } from './MeetingFormCoverImageSection'

const { uploadCoverImage } = vi.hoisted(() => ({
  uploadCoverImage: vi.fn(),
}))

vi.mock('./useMeetingCoverImageUpload', () => ({
  useMeetingCoverImageUpload: () => ({
    uploadCoverImage,
    isUploading: false,
    error: null,
  }),
  uploadMeetingCoverImage: vi.fn(),
}))

describe('MeetingFormCoverImageSection', () => {
  beforeEach(() => {
    uploadCoverImage.mockReset()
  })

  it('does not throw or upload when meetingId is a non-string (JAVASCRIPT-REACT-30)', async () => {
    const user = userEvent.setup()
    const onStagedCoverFileChange = vi.fn()

    render(
      <MeetingFormCoverImageSection
        formId="meeting-form"
        meetingId={123 as unknown as string}
        coverImageUrl={null as unknown as string}
        onCoverImageUrlChange={() => {}}
        stagedCoverFile={null}
        onStagedCoverFileChange={onStagedCoverFileChange}
      />,
    )

    expect(
      screen.getByText(
        'Choose an image now — it uploads when you create the meeting.',
      ),
    ).toBeInTheDocument()

    const file = new File(['cover'], 'cover.png', { type: 'image/png' })
    const input = document.getElementById(
      'meeting-form-cover-image',
    ) as HTMLInputElement

    await user.upload(input, file)

    expect(onStagedCoverFileChange).toHaveBeenCalledWith(file)
    expect(uploadCoverImage).not.toHaveBeenCalled()
  })

  it('uploads immediately when meetingId is a non-empty string', async () => {
    const user = userEvent.setup()
    uploadCoverImage.mockResolvedValue('https://cdn.example/cover.webp')
    const onCoverImageUrlChange = vi.fn()
    const onStagedCoverFileChange = vi.fn()

    render(
      <MeetingFormCoverImageSection
        formId="meeting-form-edit"
        meetingId=" meeting-1 "
        coverImageUrl=""
        onCoverImageUrlChange={onCoverImageUrlChange}
        stagedCoverFile={null}
        onStagedCoverFileChange={onStagedCoverFileChange}
      />,
    )

    expect(
      screen.getByText(
        'Upload a 16:9 image (JPG, PNG, or WebP). It is saved to storage immediately.',
      ),
    ).toBeInTheDocument()

    const file = new File(['cover'], 'cover.png', { type: 'image/png' })
    const input = document.getElementById(
      'meeting-form-edit-cover-image',
    ) as HTMLInputElement

    await user.upload(input, file)

    expect(onStagedCoverFileChange).toHaveBeenCalledWith(file)
    expect(uploadCoverImage).toHaveBeenCalledWith('meeting-1', file)
    expect(onCoverImageUrlChange).toHaveBeenCalledWith(
      'https://cdn.example/cover.webp',
    )
  })
})
