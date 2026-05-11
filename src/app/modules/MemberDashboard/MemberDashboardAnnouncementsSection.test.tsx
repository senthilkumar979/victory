import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

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
})
