'use client'

import { MeetingsListView } from '@/app/modules/Meetings/MeetingsListView'
import { PageMain } from '@/templates/PagaMain'
import { PageHeader } from '@/templates/PageHeader'

export default function MeetingsPage() {
  return (
    <PageMain>
      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
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
