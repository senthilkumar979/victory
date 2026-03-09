'use client'

import { useCheckIsAuthenticated } from '../../../hooks/useCheckIsAuthenticated'
import { PageMain } from '../../../ui/templates/PagaMain'
import { PageHeader } from '../../../ui/templates/PageHeader'
import { GeneralSettings } from '../../modules/Settings/GeneralSettings'

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
