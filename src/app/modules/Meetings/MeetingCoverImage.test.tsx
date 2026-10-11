import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import type { MeetingFormState } from './Meeting.types'
import { MeetingCoverImage } from './MeetingCoverImage'

const PLACEHOLDER =
  'https://91qunajyvl11yxyb.public.blob.vercel-storage.com/meeting-placeholder.png'

function makeMeeting(coverImageUrl = ''): MeetingFormState {
  return {
    title: 'Weekly sync',
    date: '2026-10-11T10:00:00+05:30',
    googleGroupId: 'group-1',
    description: '',
    meetingLink: '',
    coverImageUrl,
  }
}

afterEach(() => {
  cleanup()
})

describe('MeetingCoverImage', () => {
  it('uses the placeholder when the meeting has no cover', () => {
    render(<MeetingCoverImage meeting={makeMeeting('')} />)

    expect(screen.getByAltText('Meeting placeholder')).toHaveAttribute(
      'src',
      PLACEHOLDER,
    )
  })

  it('renders the meeting cover and hides the placeholder when a url is set', () => {
    render(<MeetingCoverImage meeting={makeMeeting('https://cdn.example/meet.png')} />)

    const cover = document.querySelector('img')
    expect(cover).toHaveAttribute('src', 'https://cdn.example/meet.png')
    expect(cover).toHaveAttribute('alt', '')
    expect(screen.queryByAltText('Meeting placeholder')).toBeNull()
  })

  it('treats a whitespace cover url as a real image', () => {
    render(<MeetingCoverImage meeting={makeMeeting('   ')} />)

    expect(document.querySelector('img')).toHaveAttribute('src', '   ')
    expect(screen.queryByAltText('Meeting placeholder')).toBeNull()
  })
})
