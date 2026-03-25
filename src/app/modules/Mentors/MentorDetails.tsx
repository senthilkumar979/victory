'use client'

import { AnimatePresence, motion } from 'framer-motion'

import { Linkedin } from 'lucide-react'
import { Button, InfoButton } from '../../../ui/atoms/button/Button'
import { accent, layoutEase, type MentorKey } from './Mentors'
import { type Mentor } from './mentorsContent'

interface MentorDetailsProps {
  mentor: Mentor
  activeKey: MentorKey
}

export default function MentorDetails({ mentor, activeKey }: MentorDetailsProps) {
  return (
    <div className="flex min-w-0 flex-1 flex-col justify-center text-center md:text-left">
      <AnimatePresence mode="wait">
        <motion.article
          key={activeKey}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -14 }}
          transition={{ duration: 0.42, ease: layoutEase }}
          className="relative mx-auto w-full max-w-xl md:mx-0"
        >
          <div
            className="mx-auto mb-6 h-1 w-16 rounded-full md:mx-0"
            style={{
              background: `linear-gradient(90deg, ${accent}, rgba(213,63,140,0.25))`,
            }}
            aria-hidden
          />

          <h3 className="text-balance text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl lg:text-[2.5rem] lg:leading-tight">
            <span className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent">
              {mentor.name}
            </span>
          </h3>

          <p className="mt-3 inline-flex items-center justify-center rounded-full border border-[#d53f8c]/20 bg-[#d53f8c]/[0.06] px-4 py-1.5 text-sm font-semibold text-[#b8327a] md:justify-start">
            {mentor.role}
          </p>

          <div className="relative mt-7 rounded-2xl border border-gray-200/90 bg-gradient-to-b from-white to-gray-50/90 p-5 text-left shadow-sm ring-1 ring-black/[0.03] sm:p-6">
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-px rounded-t-2xl bg-gradient-to-r from-transparent via-[#d53f8c]/35 to-transparent"
              aria-hidden
            />
            <p className="text-[15px] leading-[1.7] text-gray-600 sm:text-base">
              {mentor.description}
            </p>
            <p className="flex flex-wrap gap-2 mt-3">
              {mentor.skills.map((skill) => (
                <span key={skill} className="rounded-full bg-primary/10 px-2 py-1 text-sm font-medium text-primary-strong">
                  {skill}
                </span>
              ))}
            </p>
            <InfoButton mode="outline"
              onClick={() => window.open(mentor.linkedin, '_blank')} className="mt-4"
            >
              <Linkedin className="size-4" /> View LinkedIn Profile
            </InfoButton>
          </div>
        </motion.article>
      </AnimatePresence>
    </div>
  )
}
