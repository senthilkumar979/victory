import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import type { AnnouncementFormState } from '@/app/modules/Announcements/Announcement.types'

import { MemberDashboardAnnouncementsSection } from './MemberDashboardAnnouncementsSection'

vi.mock('framer-motion', () => ({
  motion: {
    li: 'li',
  },
}))

function makeAnnouncement(index: number): AnnouncementFormState {
  return {
    id: `announcement-${index}`,
    title: `Announcement ${index}`,
    description: `<p>Details for <strong>announcement ${index}</strong></p>`,
    created_at: '2026-05-11T00:00:00.000Z',
  }
}

const PREVIEW_LEN = 160

afterEach(() => {
  cleanup()
})

describe('MemberDashboardAnnouncementsSection', () => {
  it('renders only the latest five announcements with plain-text previews', () => {
    render(
      <MemberDashboardAnnouncementsSection
        announcements={[
          {
            ...makeAnnouncement(1),
            description:
              '<p>Important <strong>profile</strong> update</p><script>alert("x")</script>',
          },
          makeAnnouncement(2),
          makeAnnouncement(3),
          makeAnnouncement(4),
          makeAnnouncement(5),
          makeAnnouncement(6),
        ]}
        isLoading={false}
        error={null}
      />,
    )

    expect(screen.getByText('Announcement 1')).toBeInTheDocument()
    expect(screen.getByText('Important profile update alert("x")')).toBeInTheDocument()
    expect(screen.queryByText('Announcement 6')).not.toBeInTheDocument()
    expect(screen.queryByText(/<strong>/)).not.toBeInTheDocument()
  })

  it('shows the provided error instead of empty-state copy', () => {
    render(
      <MemberDashboardAnnouncementsSection
        announcements={[]}
        isLoading={false}
        error="Unable to load announcements"
      />,
    )

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Unable to load announcements',
    )
    expect(screen.queryByText('No announcements yet.')).not.toBeInTheDocument()
  })

  it('shows loading placeholders ahead of an error or a populated list', () => {
    const { container } = render(
      <MemberDashboardAnnouncementsSection
        announcements={[makeAnnouncement(1)]}
        isLoading
        error="Unable to load announcements"
      />,
    )

    expect(container.querySelectorAll('.animate-pulse')).toHaveLength(3)
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.queryByText('Announcement 1')).not.toBeInTheDocument()
    expect(screen.queryByText('No announcements yet.')).not.toBeInTheDocument()
  })

  it('truncates plain-text previews after 160 characters', () => {
    const body = 'a'.repeat(PREVIEW_LEN + 1)

    render(
      <MemberDashboardAnnouncementsSection
        announcements={[
          {
            id: 'long',
            title: 'Long note',
            description: `<p>${body}</p>`,
            created_at: undefined,
          },
        ]}
        isLoading={false}
        error={null}
      />,
    )

    expect(screen.getByText(`${'a'.repeat(PREVIEW_LEN)}…`)).toBeInTheDocument()
    expect(screen.queryByText(body)).not.toBeInTheDocument()
  })

  it('keeps a 160-character preview intact and omits a missing date', () => {
    const body = 'b'.repeat(PREVIEW_LEN)

    const { container } = render(
      <MemberDashboardAnnouncementsSection
        announcements={[
          {
            id: 'exact',
            title: 'Exact note',
            description: body,
          },
        ]}
        isLoading={false}
        error={null}
      />,
    )

    expect(screen.getByText(body)).toBeInTheDocument()
    expect(container.querySelector('.text-slate-400')).not.toBeInTheDocument()
  })

  it('omits a preview when the description is only markup or whitespace', () => {
    render(
      <MemberDashboardAnnouncementsSection
        announcements={[
          {
            id: 'empty',
            title: 'Title only',
            description: '<p>   </p><br/><script></script>',
          },
        ]}
        isLoading={false}
        error={null}
      />,
    )

    const item = screen.getByText('Title only').closest('li')
    expect(item?.textContent).toBe('Title only')
  })
})
