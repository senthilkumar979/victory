'use client'

import { SubTitle } from '@/templates/SubTitle'
import { Title } from '@/templates/Title'
import { useCheckIsAuthenticated } from '../../../hooks/useCheckIsAuthenticated'
import { GeneralSettings } from '../../modules/Settings/GeneralSettings'
import {
  SettingsNav,
  SettingsNavItem,
} from '../../modules/Settings/SettingsNav'
import { Students } from '../../modules/Students/Students'

const AdminSettingsPage = () => {
  useCheckIsAuthenticated()

  const items: SettingsNavItem[] = [
    {
      value: 'general',
      label: 'General',
      content: (
        <div className="space-y-2 ">
          <div className="border-l-3 border-primary pl-4">
            <SubTitle>General</SubTitle>
            <p className="text-sm text-gray-500 mb-4">
              Manage high-level admin settings and defaults.
            </p>
          </div>
          <GeneralSettings />
        </div>
      ),
    },
    {
      value: 'security',
      label: 'Security',
      content: (
        <div className="space-y-2">
          <div className="border-l-3 border-primary pl-4">
            <SubTitle>Security</SubTitle>
            <p className="text-sm text-gray-500 mb-4">
              Configure authentication, roles, and access controls.
            </p>
          </div>
        </div>
      ),
    },
    {
      value: 'users',
      label: 'Users',
      content: (
        <div className="space-y-2">
          <div className="border-l-3 border-primary pl-4">
            <SubTitle>Students</SubTitle>
            <p className="text-sm text-gray-500 mb-4">
              Directory of students with their current roles, batches,
              companies, and social links.
            </p>
          </div>
          <Students />
        </div>
      ),
    },
  ]

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

        <SettingsNav items={items} />
      </div>
    </main>
  )
}

export default AdminSettingsPage
