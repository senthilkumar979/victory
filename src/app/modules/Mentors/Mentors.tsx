'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'

import { cn } from '@/lib/utils'

import MentorDetails from './MentorDetails'
import { MentorPhoto } from './MentorPhoto'
import { Mentor, mentors } from './mentorsContent'

export type MentorKey = 'sk' | 'dhileepan'

export const accent = '#d53f8c'
export const layoutEase = [0.42, 0, 0.58, 1] as const
export const layoutTransition = { duration: 0.6, ease: layoutEase }

const activeBlockTransition = {
  duration: 0.42,
  ease: layoutEase,
}

export default function Mentors() {
  const [activeMentor, setActiveMentor] = useState<MentorKey>('sk')
  const inactiveKey: MentorKey = activeMentor === 'sk' ? 'dhileepan' : 'sk'
  const active: Mentor = mentors.find((m) => m.id === activeMentor)!
  const inactive: Mentor = mentors.find((m) => m.id === inactiveKey)!

  return (
    <section className="relative isolate overflow-hidden bg-gradient-to-br from-white via-pink-50/80 to-white py-8">
      <div
        className="pointer-events-none absolute left-1/4 top-[-8%] h-[26rem] w-[26rem] rounded-full opacity-20 blur-3xl"
        style={{ backgroundColor: accent }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-[-15%] right-[-5%] h-[20rem] w-[20rem] rounded-full opacity-20 blur-3xl"
        style={{ backgroundColor: accent }}
        aria-hidden
      />

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <header className="mb-12 text-center md:mb-16">
          <p className="mb-2 mx-auto w-fit rounded-full bg-primary-strong p-2 text-center font-mono text-[11px] font-medium uppercase tracking-[0.35em] text-white">
            Who We Are
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Meet the Mentors Behind{' '}
            <span className="text-primary-strong">MentorBridge</span>
          </h2>
        </header>

        <div className="relative flex min-h-0 flex-col gap-10 md:block md:min-h-[min(520px,70vh)] md:pb-28">
          <div className="relative z-10 w-full overflow-hidden md:overflow-visible mb-10">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={activeMentor}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={activeBlockTransition}
                className={cn(
                  'flex items-center gap-8 md:flex-row md:items-stretch md:gap-10',
                  activeMentor === 'sk'
                    ? 'flex-col'
                    : 'flex-col-reverse md:flex-row',
                )}
              >
                {activeMentor === 'sk' ? (
                  <>
                    <MentorPhoto mentorKey="sk" size="active" />
                    <MentorDetails mentor={active} activeKey={activeMentor} />
                  </>
                ) : (
                  <>
                    <MentorDetails mentor={active} activeKey={activeMentor} />
                    <MentorPhoto mentorKey="dhileepan" size="active" />
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <motion.div
            layout
            transition={{ layout: { duration: 0.5, ease: layoutEase } }}
            className={cn(
              'flex flex-col items-center gap-2 md:absolute md:bottom-0 md:z-20 md:w-auto',
              inactiveKey === 'dhileepan'
                ? 'md:right-0 md:items-end'
                : 'md:left-0 md:items-start',
            )}
          >
            <AnimatePresence mode="wait">
              <motion.button
                key={inactiveKey}
                type="button"
                layout
                initial={{ opacity: 0.92, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0.85, scale: 0.96 }}
                transition={{ duration: 0.35, ease: layoutEase }}
                onClick={() => setActiveMentor(inactiveKey)}
                className="group flex cursor-pointer flex-col items-center gap-2 rounded-2xl p-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d53f8c] focus-visible:ring-offset-2"
                aria-label={`Show ${inactive?.name} as featured mentor`}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="mt-5">
                  <MentorPhoto mentorKey={inactiveKey} size="inactive" />
                </div>
                <p className="max-w-[7rem] text-center text-sm font-medium text-gray-800">
                  {inactive?.name}
                </p>
              </motion.button>
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
