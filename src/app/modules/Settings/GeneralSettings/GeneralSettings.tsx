import { joinClassNames } from '@/utils/tailwindUtils'
import { useState } from 'react'
import { SettingsNavItem } from '../SettingsNav/SettingNav.types'

export const GeneralSettings = () => {
  const navItems: SettingsNavItem[] = [
    { value: 'overview', label: 'Overview', content: <></> },
  ]

  const [activeTab, setActiveTab] = useState('overview')

  const loadActiveContent = () => {
    return navItems?.find((item) => item?.value === activeTab)?.content
  }

  return (
    <div className="flex rounded-lg border border-zinc-200 shadow bg-white min-h-[300px]">
      <nav className="w-40 border-r border-zinc-200 bg-zinc-50 py-2 flex flex-col gap-1 shrink-0">
        {navItems.map((item) => {
          const isActive = item.value === activeTab
          return (
            <button
              key={item.value}
              type="button"
              onClick={() => setActiveTab(item.value)}
              className={joinClassNames(
                'w-full rounded-md px-3 py-2 text-left text-sm outline-none transition-colors',
                'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-primary-50 dark:focus-visible:ring-primary-100 dark:focus-visible:ring-offset-primary-950',
                item.disabled &&
                  'cursor-not-allowed text-primary-400 dark:text-primary-600 focus-visible:ring-0 focus-visible:ring-offset-0',
                !item.disabled &&
                  !isActive &&
                  'text-primary border border-transparent hover:bg-primary-100 hover:text-primary-900 dark:text-primary-300 hover:border-primary dark:hover:border-primary dark:hover:text-primary hover:border-primary-200',
                !item.disabled &&
                  isActive &&
                  'bg-primary font-medium text-primary-900 shadow-sm dark:bg-primary-900 dark:text-primary-50',
              )}
            >
              {item.label}
            </button>
          )
        })}
      </nav>
      <section className="flex-1 p-6">{loadActiveContent()}</section>
    </div>
  )
}
