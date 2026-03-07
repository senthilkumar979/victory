'use client'

import { Title } from '@/templates/Title'
import { useCheckIsAuthenticated } from '../../../hooks/useCheckIsAuthenticated'
import { GeneralSettings } from '../../modules/Settings/GeneralSettings'

const AdminSettingsPage = () => {
  useCheckIsAuthenticated()

  return (
    <main className="min-h-screen px-6 py-10">
      <div className="mx-auto w-full max-w-8xl space-y-6">
        <header className="space-y-1">
          <Title as="h1" className="text-2xl font-semibold text-primary">
            Admininistration
          </Title>
          <p className="text-sm text-secondary">
            Choose a section from the left to edit its settings.
          </p>
        </header>

        <GeneralSettings />
      </div>
    </main>
  )
}

export default AdminSettingsPage
