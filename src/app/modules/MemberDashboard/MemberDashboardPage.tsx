'use client'

import { MemberDashboardAnnouncementsSection } from '@/app/modules/MemberDashboard/MemberDashboardAnnouncementsSection'
import { MemberDashboardHeader } from '@/app/modules/MemberDashboard/MemberDashboardHeader'
import { MemberDashboardParticipationsSection } from '@/app/modules/MemberDashboard/MemberDashboardParticipationsSection'
import { MemberDashboardProfileChecklist } from '@/app/modules/MemberDashboard/MemberDashboardProfileChecklist'
import { MemberDashboardQuickLinks } from '@/app/modules/MemberDashboard/MemberDashboardQuickLinks'
import { MemberDashboardWeekSection } from '@/app/modules/MemberDashboard/MemberDashboardWeekSection'
import { useCheckIsAuthenticated } from '@/hooks/useCheckIsAuthenticated'
import { useAnnouncements } from '@/hooks/useAnnouncements'
import { useFetchParticipationsByUser } from '@/hooks/useFetchParticipationsByUser'
import { useMemberDashboardStudent } from '@/hooks/useMemberDashboardStudent'
import {
  getProfileChecklistItems,
  isStudentProfileComplete,
} from '@/lib/studentProfileCompleteness'
import { PrimaryButton } from '@/atoms/button/Button'
import { PageMain } from '@/templates/PagaMain'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export const MemberDashboardPage = () => {
  useCheckIsAuthenticated()
  const { user } = useUser()
  const router = useRouter()
  const {
    profile,
    isLoading: studentLoading,
    error: studentError,
    refetch: refetchStudent,
  } = useMemberDashboardStudent()
  const {
    announcements,
    isLoading: annLoading,
    error: annError,
  } = useAnnouncements()
  const serialNo =
    profile?.serialNo && profile.serialNo > 0 ? profile.serialNo : undefined
  const {
    participations,
    isLoading: partLoading,
    error: partError,
  } = useFetchParticipationsByUser(serialNo)

  useEffect(() => {
    if (studentLoading || studentError) return
    if (!profile || !isStudentProfileComplete(profile)) {
      router.replace('/secured/profile')
    }
  }, [studentLoading, studentError, profile, router])

  const displayName =
    user?.firstName ||
    user?.username ||
    user?.primaryEmailAddress?.emailAddress ||
    'there'

  if (studentLoading) {
    return (
      <PageMain>
        <div className="relative mx-auto max-w-5xl px-4 py-12 sm:px-6">
          <div className="h-10 w-64 animate-pulse rounded-lg bg-slate-200" />
          <div className="mt-8 h-64 animate-pulse rounded-2xl bg-slate-100" />
        </div>
      </PageMain>
    )
  }

  if (studentError) {
    return (
      <PageMain>
        <div className="relative mx-auto max-w-5xl px-4 py-16 text-center">
          <p className="text-slate-700">{studentError}</p>
          <PrimaryButton className="mt-4" onClick={() => void refetchStudent()}>
            Try again
          </PrimaryButton>
        </div>
      </PageMain>
    )
  }

  if (!profile || !isStudentProfileComplete(profile)) {
    return (
      <PageMain>
        <div className="relative mx-auto max-w-5xl px-4 py-16 text-center text-slate-600">
          <p>Redirecting to your profile…</p>
        </div>
      </PageMain>
    )
  }

  const checklist = getProfileChecklistItems(profile)

  return (
    <PageMain>
      <div className="relative mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div>
          <MemberDashboardHeader displayName={displayName} profile={profile} />
          <MemberDashboardWeekSection />
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <div className="space-y-6">
              <MemberDashboardAnnouncementsSection
                announcements={announcements}
                isLoading={annLoading}
                error={annError}
              />
              <MemberDashboardParticipationsSection
                participations={participations}
                isLoading={partLoading}
                error={partError}
              />
            </div>
            <div className="space-y-6">
              <MemberDashboardProfileChecklist items={checklist} />
              <MemberDashboardQuickLinks />
            </div>
          </div>
        </div>
      </div>
    </PageMain>
  )
}
