'use client'

import { LayoutGroup, motion } from 'framer-motion'
import { useState } from 'react'

import { cn } from '@/lib/utils'

import MentorDetails from './MentorDetails'
import { MentorPhoto } from './MentorPhoto'
import { Mentor, mentors } from './mentorsContent'

export type MentorKey = 'sk' | 'dhileepan'

export const accent = '#d53f8c'
export const layoutEase = [0.42, 0, 0.58, 1] as const
export const layoutTransition = { duration: 0.6, ease: layoutEase }

export default function Mentors() {
  const [activeMentor, setActiveMentor] = useState<MentorKey>('sk')
  const inactiveKey: MentorKey = activeMentor === 'sk' ? 'dhileepan' : 'sk'
  const active: Mentor = mentors.find((m) => m.id === activeMentor)!
  const inactive: Mentor = mentors.find((m) => m.id === inactiveKey)!

  return (
    <section className="relative isolate overflow-hidden bg-gradient-to-br from-white via-pink-50/80 to-white py-16 md:py-24">
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
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
            WHO WE ARE
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Meet the Mentors Behind{' '}
            <span className="text-[#d53f8c]">MentorBridge</span>
          </h2>
        </header>

        <LayoutGroup>
          <div className="relative flex min-h-0 flex-col gap-10 md:block md:min-h-[min(520px,70vh)] md:pb-28">
            <div className="relative z-10 w-full">
              {activeMentor === 'sk' ? (
                <div className="flex flex-col items-center gap-8 md:flex-row md:items-stretch md:gap-10">
                  <MentorPhoto mentorKey="sk" size="active" />
                  <MentorDetails mentor={active} activeKey={activeMentor} />
                </div>
              ) : (
                <div className="flex flex-col-reverse items-center gap-8 md:flex-row md:items-stretch md:gap-10">
                  <MentorDetails mentor={active} activeKey={activeMentor} />
                  <MentorPhoto mentorKey="dhileepan" size="active" />
                </div>
              )}
            </div>

            <motion.div
              layout
              transition={layoutTransition}
              className={cn(
                'flex flex-col items-center gap-2 md:absolute md:bottom-0 md:z-20 md:w-auto',
                inactiveKey === 'dhileepan'
                  ? 'md:right-0 md:items-end'
                  : 'md:left-0 md:items-start',
              )}
            >
              <motion.button
                type="button"
                layout
                onClick={() => setActiveMentor(inactiveKey)}
                className="group flex cursor-pointer flex-col items-center gap-2 rounded-2xl p-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d53f8c] focus-visible:ring-offset-2"
                aria-label={`Show ${inactive?.name} as featured mentor`}
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.25 }}
              >
                <div className="mt-10">
                  <MentorPhoto mentorKey={inactiveKey} size="inactive" />
                </div>
                <p className="max-w-[7rem] text-center text-sm font-medium text-gray-800">
                  {inactive?.name}
                </p>
              </motion.button>
            </motion.div>
          </div>
        </LayoutGroup>
      </div>
    </section>
  )
}
