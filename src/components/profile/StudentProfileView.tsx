'use client'

import { motion } from 'framer-motion'

import { ProfileAbout } from '@/components/profile/sections/ProfileAbout'
import { ProfileAwards } from '@/components/profile/sections/ProfileAwards'
import { ProfileBlogs } from '@/components/profile/sections/ProfileBlogs'
import { ProfileExperience } from '@/components/profile/sections/ProfileExperience'
import { ProfileGitHub } from '@/components/profile/sections/ProfileGitHub'
import { ProfileHero } from '@/components/profile/sections/ProfileHero'
import { ProfileInspirations } from '@/components/profile/sections/ProfileInspirations'
import { ProfileMentorBridge } from '@/components/profile/sections/ProfileMentorBridge'
import { ProfilePlaceholder } from '@/components/profile/sections/ProfilePlaceholder'
import { ProfileResume } from '@/components/profile/sections/ProfileResume'
import { ProfileSkills } from '@/components/profile/sections/ProfileSkills'
import { hasMentorBridgeExp } from '@/components/profile/profile.utils'
import { useStudentAwards } from '@/hooks/useStudentAwards'
import { useStudentBlogs } from '@/hooks/useStudentBlogs'

import type { ProfileData } from '@/types/student.types'

interface StudentProfileViewProps {
  student: ProfileData
}

export const StudentProfileView = ({ student }: StudentProfileViewProps) => {
  const { blogs, loading: blogsLoading } = useStudentBlogs(
    student.mediumUsername,
    student.name,
  )
  const { awards, loading: awardsLoading } = useStudentAwards(student.email)

  const showMentorBridge = hasMentorBridgeExp(student.mentorBridgeExp)
  const mbExp = showMentorBridge ? (student.mentorBridgeExp as Parameters<typeof ProfileMentorBridge>[0]['exp']) : null

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-8">
        <ProfileHero student={student} />

        {student.summary && (
          <ProfileAbout summary={student.summary} />
        )}

        {student.skillSets && student.skillSets.length > 0 && (
          <ProfileSkills skills={student.skillSets} />
        )}

        {student.experience && student.experience.length > 0 && (
          <ProfileExperience experience={student.experience} />
        )}

        {showMentorBridge && mbExp && (
          <ProfileMentorBridge exp={mbExp} />
        )}

        {student.inspirations && student.inspirations.length > 0 && (
          <ProfileInspirations inspirations={student.inspirations} />
        )}

        <ProfileBlogs blogs={blogs} loading={blogsLoading} />

        <ProfileGitHub githubUrl={student.socialLinks?.gitHub} />

        <ProfileAwards awards={awards} loading={awardsLoading} />

        <ProfilePlaceholder title="Topics Presented" />
        <ProfilePlaceholder title="Appreciations" />

        {student.resumeLink && (
          <ProfileResume resumeLink={student.resumeLink} />
        )}
      </div>

      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-md lg:sticky lg:top-8"
        >
          <h3 className="mb-4 text-lg font-semibold text-slate-900">
            Quick Links
          </h3>
          <div className="space-y-3">
            {student.resumeLink && (
              <a
                href={student.resumeLink}
                target="_blank"
                rel="noreferrer"
                className="block rounded-lg border border-slate-200 p-3 text-sm font-medium text-slate-700 transition-colors hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
              >
                Resume
              </a>
            )}
            {student.email && (
              <a
                href={`mailto:${student.email}`}
                className="block rounded-lg border border-slate-200 p-3 text-sm font-medium text-slate-700 transition-colors hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
              >
                Contact
              </a>
            )}
            {student.socialLinks?.linkedIn && (
              <a
                href={student.socialLinks.linkedIn}
                target="_blank"
                rel="noreferrer"
                className="block rounded-lg border border-slate-200 p-3 text-sm font-medium text-slate-700 transition-colors hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
              >
                LinkedIn
              </a>
            )}
            {student.socialLinks?.gitHub && (
              <a
                href={student.socialLinks.gitHub}
                target="_blank"
                rel="noreferrer"
                className="block rounded-lg border border-slate-200 p-3 text-sm font-medium text-slate-700 transition-colors hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
              >
                GitHub
              </a>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
