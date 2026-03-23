'use client'

import { PageMain } from '@/ui/templates/PagaMain'
import { PageHeader } from '@/ui/templates/PageHeader'
import { UserProfile } from '@clerk/nextjs'

export default function AccountPage() {
  return (
    <PageMain>
      <div className="relative px-2 py-12">
        <PageHeader
          title="Account"
          description="Manage your account settings and preferences."
          subtitle="Account"
        />
        <div className="flex justify-center items-center h-full">
          <UserProfile />
        </div>
      </div>
    </PageMain>
  )
}
