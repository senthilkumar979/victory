'use client'

import { UserProfile } from '@clerk/nextjs'

import { PageMain } from '@/ui/templates/PagaMain'
import { PageHeader } from '@/ui/templates/PageHeader'

// Clerk tabs such as /security update the URL in place. Next.js then posts
// session server actions to that URL, so it has to be a real route.
export const AccountPage = () => {
  return (
    <PageMain>
      <div className="relative px-2 py-12">
        <PageHeader
          title="Account"
          description="Manage your account settings and preferences."
          subtitle="Account"
        />
        <div className="flex justify-center items-center h-full">
          <UserProfile path="/secured/account" routing="path" />
        </div>
      </div>
    </PageMain>
  )
}

export default AccountPage
