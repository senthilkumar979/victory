'use client'

import { useCheckIsAuthenticated } from '@/hooks/useCheckIsAuthenticated'
import { GeneralSettings } from '@/modules/Settings/GeneralSettings'
import { PageMain } from '@/templates/PagaMain'
import { PageHeader } from '@/templates/PageHeader'

const AdminSettingsPage = () => {
  useCheckIsAuthenticated()

  return (
    <PageMain>
      <div className="relative px-2 py-12">
        <PageHeader
          title="Admininistration"
          description="Choose a section from the left to edit its settings."
          subtitle="Settings"
        />

        <GeneralSettings />
      </div>
    </PageMain>
  )
}

export default AdminSettingsPage
