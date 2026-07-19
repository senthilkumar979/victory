import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { VideoFormFields } from './VideoFormFields'
import {
  sessionVideoFormSchema,
  type SessionVideoFormValues,
} from '@/lib/sessionVideos/sessionVideoSchemas'
import { SESSION_VIDEO_CATEGORIES } from '@/lib/sessionVideos/sessionVideoCategories'

vi.mock('next/image', () => ({
  default: ({ alt }: { alt: string }) => <img alt={alt} />,
}))

const defaultValues: SessionVideoFormValues = {
  title: '',
  youtubeUrl: '',
  category: SESSION_VIDEO_CATEGORIES.GENERAL_SESSION,
  isFeatured: false,
}

function VideoFormTestHarness({
  isOpen = true,
  onValidSubmit,
}: {
  isOpen?: boolean
  onValidSubmit: (data: SessionVideoFormValues) => void
}) {
  const form = useForm<SessionVideoFormValues>({
    resolver: zodResolver(sessionVideoFormSchema),
    defaultValues,
  })
  const { reset, handleSubmit } = form

  useEffect(() => {
    if (!isOpen) return
    reset(defaultValues)
  }, [isOpen, reset])

  if (!isOpen) return null

  return (
    <>
      <form id="video-form" onSubmit={handleSubmit(onValidSubmit)}>
        <VideoFormFields formId="video-form" form={form} />
      </form>
      <button type="submit" form="video-form">
        Save
      </button>
    </>
  )
}

afterEach(() => {
  cleanup()
})

describe('VideoFormFields', () => {
  it('submits filled values from controlled FormInput fields', async () => {
    const user = userEvent.setup()
    const onValidSubmit = vi.fn()

    render(<VideoFormTestHarness onValidSubmit={onValidSubmit} />)

    await user.type(
      screen.getByPlaceholderText('Session title'),
      'React hooks deep dive',
    )
    await user.type(
      screen.getByPlaceholderText('https://www.youtube.com/watch?v=...'),
      'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    )
    await user.selectOptions(
      screen.getByLabelText(/Category/i),
      SESSION_VIDEO_CATEGORIES.REACT_SESSION,
    )

    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(onValidSubmit).toHaveBeenCalledTimes(1)
    expect(onValidSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'React hooks deep dive',
        youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        category: SESSION_VIDEO_CATEGORIES.REACT_SESSION,
        isFeatured: false,
      }),
      expect.anything(),
    )
  })

  it('submits values after drawer remount with external submit button', async () => {
    const user = userEvent.setup()
    const onValidSubmit = vi.fn()

    const { rerender } = render(
      <VideoFormTestHarness isOpen={false} onValidSubmit={onValidSubmit} />,
    )

    rerender(
      <VideoFormTestHarness isOpen={true} onValidSubmit={onValidSubmit} />,
    )

    await user.type(
      screen.getByPlaceholderText('Session title'),
      'Lifecycle test title',
    )
    await user.type(
      screen.getByPlaceholderText('https://www.youtube.com/watch?v=...'),
      'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    )

    await user.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(onValidSubmit).toHaveBeenCalledTimes(1)
    })

    expect(onValidSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Lifecycle test title',
        youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      }),
      expect.anything(),
    )
  })

  it('keeps form state in sync after delayed reset on drawer open', async () => {
    const user = userEvent.setup()
    const onValidSubmit = vi.fn()

    render(<VideoFormTestHarness onValidSubmit={onValidSubmit} />)

    await user.type(
      screen.getByPlaceholderText('Session title'),
      'Delayed reset title',
    )
    await user.type(
      screen.getByPlaceholderText('https://www.youtube.com/watch?v=...'),
      'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    )

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Session title')).toHaveValue(
        'Delayed reset title',
      )
    })

    await user.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(onValidSubmit).toHaveBeenCalledTimes(1)
    })

    expect(onValidSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Delayed reset title',
        youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        category: SESSION_VIDEO_CATEGORIES.GENERAL_SESSION,
      }),
      expect.anything(),
    )
  })
})
