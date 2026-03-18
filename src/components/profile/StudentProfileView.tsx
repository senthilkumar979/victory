'use client'

import { BentoCard } from '@/components/profile/BentoCard'
import { hasMentorBridgeExp } from '@/components/profile/profile.utils'
import { ProfileAbout } from '@/components/profile/sections/ProfileAbout'
import { ProfileAwards } from '@/components/profile/sections/ProfileAwards'
import { ProfileBlogs } from '@/components/profile/sections/ProfileBlogs'
import { ProfileExperience } from '@/components/profile/sections/ProfileExperience'
import { ProfileGitHub } from '@/components/profile/sections/ProfileGitHub'
import { ProfileHero } from '@/components/profile/sections/ProfileHero'
import { ProfileInspirations } from '@/components/profile/sections/ProfileInspirations'
import { ProfileMentorBridge } from '@/components/profile/sections/ProfileMentorBridge'
import { ProfileSkills } from '@/components/profile/sections/ProfileSkills'
import { ProfileStats } from '@/components/profile/sections/ProfileStats'
import { useStudentAwards } from '@/hooks/useStudentAwards'
import { useStudentBlogs } from '@/hooks/useStudentBlogs'

import type { ProfileData } from '@/types/student.types'
import { ProfileParticipations } from './sections/ProfileParticipations'
import { ProfilePresentations } from './sections/ProfilePresentations'

interface StudentProfileViewProps {
  student: ProfileData
}

export const StudentProfileView = ({ student }: StudentProfileViewProps) => {
  const { blogs, loading: blogsLoading } = useStudentBlogs(
    student.mediumUsername,
    student.name,
  )
  console.log('student', student)
  const { awards, loading: awardsLoading } = useStudentAwards(student.email)

  const showMentorBridge = hasMentorBridgeExp(student.mentorBridgeExp)
  const mbExp = showMentorBridge
    ? (student.mentorBridgeExp as Parameters<
        typeof ProfileMentorBridge
      >[0]['exp'])
    : null

  const repositoriesCount = 12
  const skillsCount = student.skillSets?.length ?? 0

  return (
    <div className="space-y-10">
      <ProfileHero student={student} />

      <ProfileStats
        repositoriesCount={repositoriesCount}
        awardsCount={awards.length}
        blogsCount={blogs.length}
        skillsCount={skillsCount}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:auto-rows-[minmax(180px,auto)]">
        {student.summary && (
          <BentoCard span="lg" delay={0.05}>
            <ProfileAbout summary={student.summary} />
          </BentoCard>
        )}

        {student.skillSets && student.skillSets.length > 0 && (
          <BentoCard span="md" delay={0.08}>
            <ProfileSkills skills={student.skillSets} />
          </BentoCard>
        )}

        {student.experience && student.experience.length > 0 && (
          <BentoCard span="xl" delay={0.1}>
            <ProfileExperience experience={student.experience} />
          </BentoCard>
        )}

        {showMentorBridge && mbExp && (
          <BentoCard span="md" variant="solid" delay={0.12}>
            <ProfileMentorBridge exp={mbExp} />
          </BentoCard>
        )}

        {student.inspirations && student.inspirations.length > 0 && (
          <BentoCard span="md" delay={0.14}>
            <ProfileInspirations inspirations={student.inspirations} />
          </BentoCard>
        )}
        <BentoCard span="lg" delay={0.16}>
          <ProfileBlogs blogs={blogs} loading={blogsLoading} />
        </BentoCard>
        <BentoCard span="md" delay={0.24}>
          <ProfileParticipations serialNo={student.serialNo} />
        </BentoCard>

        <BentoCard span="xl" delay={0.18}>
          <ProfileGitHub githubUrl={student.socialLinks?.gitHub} />
        </BentoCard>
        <BentoCard span="md" delay={0.22}>
          <ProfilePresentations studentEmail={student.email} />
        </BentoCard>
        <BentoCard span="md" delay={0.2}>
          <ProfileAwards awards={awards} loading={awardsLoading} />
        </BentoCard>
      </div>
    </div>
  )
}
