'use client'

import { MeetingsListView } from '@/app/modules/Meetings/MeetingsListView'
import { PageHeader } from '@/templates/PageHeader'
import { PageMain } from '../../ui/templates/PagaMain'

export default function EventsPage() {
  return (
    <PageMain>
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <PageHeader
          title="Meetings"
          description="Join live sessions, watch recordings, and stay connected with the community."
          subtitle="Upcoming & past"
        />
        <MeetingsListView />
      </div>
    </PageMain>
  )
}
