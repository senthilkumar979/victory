import { joinClassNames } from '@/utils/tailwindUtils'
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion'
import { useState } from 'react'
import { AdminAnnouncement } from '../../Announcements/AdminAnnouncement'
import { AwardCategories } from '../../AwardCategories'
import { Awards } from '../../Awards/Awards'
import { GoogleGroups } from '../../GoogleGroups'
import { HallOfFame } from '../../HallOfFame/HallOfFame'
import { Meetings } from '../../Meetings/Meetings'
import { Partners } from '../../Partners/Partners'
import { Students } from '../../Students/Students'
import { SettingsNavItem } from '../SettingsNav/SettingNav.types'

export const GeneralSettings = () => {
  const navItems: SettingsNavItem[] = [
    {
      value: 'google-groups',
      label: 'Google Groups',
      content: <GoogleGroups />,
    },
    {
      value: 'announcements',
      label: 'Announcements',
      content: <AdminAnnouncement />,
    },
    {
      value: 'hall-of-fame',
      label: 'Hall of Fame',
      content: <HallOfFame />,
    },
    {
      value: 'meetings',
      label: 'Meetings',
      content: <Meetings />,
    },
    {
      value: 'partners',
      label: 'Partners',
      content: <Partners />,
    },
    {
      value: 'students',
      label: 'Students',
      content: <Students />,
    },
    {
      value: 'award-categories',
      label: 'Award Categories',
      content: <AwardCategories />,
    },
    {
      value: 'awards',
      label: 'Awards',
      content: <Awards />,
    },
  ]

  const [activeTab, setActiveTab] = useState('google-groups')

  const loadActiveContent = () => {
    // Wrap the content in a stacking context to ensure Modals inside render properly
    const content = navItems?.find((item) => item?.value === activeTab)?.content
    return <div className="relative z-0">{content}</div>
  }

  return (
    <div className="relative flex min-h-[500px] overflow-hidden rounded-2xl border border-slate-200/70 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 shadow-[0_18px_45px_rgba(15,23,42,0.45)]">
      <div className="pointer-events-none absolute -left-24 top-0 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-56 w-56 rounded-full bg-sky-500/25 blur-3xl" />

      <LayoutGroup>
        <motion.nav
          className="relative z-10 flex w-56 shrink-0 flex-col gap-2 border-r border-slate-800/80 bg-slate-950/80 px-3 py-4 backdrop-blur-xl"
          initial={{ x: -16, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="mb-3 px-1 text-[11px] font-medium uppercase tracking-[0.24em] text-slate-500">
            General
          </div>

          {navItems.map((item) => {
            const isActive = item.value === activeTab
            const isDisabled = Boolean(item.disabled)

            return (
              <motion.button
                key={item.value}
                type="button"
                onClick={() => {
                  if (isDisabled) return
                  setActiveTab(item.value)
                }}
                className={joinClassNames(
                  'relative w-full overflow-hidden rounded-xl px-3 py-2.5 text-left text-sm outline-none',
                  'transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 focus-visible:ring-offset-slate-950',
                  isDisabled &&
                    'cursor-not-allowed text-slate-500/60 ring-0 ring-offset-0',
                  !isDisabled &&
                    !isActive &&
                    'border border-slate-800/80 bg-slate-900/60 text-slate-300/80 hover:border-primary/50 hover:bg-slate-900/90 hover:text-slate-50',
                  !isDisabled &&
                    isActive &&
                    'border border-transparent text-slate-50 shadow-[0_14px_45px_rgba(56,189,248,0.35)]',
                )}
                whileHover={!isDisabled ? { x: 2 } : undefined}
                whileTap={!isDisabled ? { scale: 0.97 } : undefined}
              >
                {!isDisabled && isActive ? (
                  <motion.span
                    layoutId="settings-nav-active-pill"
                    className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-r from-primary/90 via-sky-500/90 to-violet-500/90"
                    transition={{
                      type: 'spring',
                      stiffness: 320,
                      damping: 26,
                      mass: 0.8,
                    }}
                  />
                ) : null}

                <div className="relative flex items-center justify-between gap-2">
                  <span className="truncate">{item.label}</span>
                  {!isDisabled && (
                    <span
                      className={joinClassNames(
                        'flex h-5 w-5 items-center justify-center rounded-full border text-[10px] font-medium',
                        isActive
                          ? 'border-white/80 bg-black/20 text-white'
                          : 'border-primary/40 bg-primary/10 text-primary/80',
                      )}
                    >
                      {item.label.charAt(0)}
                    </span>
                  )}
                </div>
              </motion.button>
            )
          })}
        </motion.nav>
      </LayoutGroup>

      <section className="relative z-10 flex-1 p-6">
        <div className="relative h-full rounded-2xl border border-slate-800/70 bg-slate-950/70 p-5 shadow-inner shadow-slate-900/60 backdrop-blur-xl">
          <div className="pointer-events-none absolute -right-10 top-6 h-32 w-32 rounded-full bg-primary/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-10 left-10 h-40 w-40 rounded-full bg-violet-600/20 blur-3xl" />

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
              className="relative h-full"
            >
              {loadActiveContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>
    </div>
  )
}
