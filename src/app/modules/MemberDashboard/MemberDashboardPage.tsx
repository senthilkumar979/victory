'use client'

import { MemberDashboardAnnouncementsSection } from '@/app/modules/MemberDashboard/MemberDashboardAnnouncementsSection'
import {
  MemberDashboardActionItems,
  MemberDashboardAssignmentsSection,
} from '@/app/modules/MemberDashboard/MemberDashboardAssignmentsSection'
import {
  MemberDashboardFeedbackSection,
  MemberDashboardVideosSection,
} from '@/app/modules/MemberDashboard/MemberDashboardVideosSection'
import { MemberDashboardHeader } from '@/app/modules/MemberDashboard/MemberDashboardHeader'
import { MemberDashboardParticipationsSection } from '@/app/modules/MemberDashboard/MemberDashboardParticipationsSection'
import { MemberDashboardProfileChecklist } from '@/app/modules/MemberDashboard/MemberDashboardProfileChecklist'
import { MemberDashboardQuickLinks } from '@/app/modules/MemberDashboard/MemberDashboardQuickLinks'
import { MemberDashboardWeekSection } from '@/app/modules/MemberDashboard/MemberDashboardWeekSection'
import { useCheckIsAuthenticated } from '@/hooks/useCheckIsAuthenticated'
import { useIsAdmin } from '@/hooks/useIsAdmin'
import { useAnnouncements } from '@/hooks/useAnnouncements'
import { useFetchParticipationsByUser } from '@/hooks/useFetchParticipationsByUser'
import { useMemberDashboardStudent } from '@/hooks/useMemberDashboardStudent'
import { useMemberDashboardAssignments } from '@/hooks/useMemberDashboardAssignments'
import { useSessionVideos } from '@/hooks/useSessionVideos'
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
  const isAdmin = useIsAdmin()
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
  const {
    assignments,
    submissions,
    isLoading: assignmentsLoading,
    error: assignmentsError,
  } = useMemberDashboardAssignments()
  const {
    videos,
    isLoading: videosLoading,
    error: videosError,
  } = useSessionVideos()

  useEffect(() => {
    if (isAdmin) return
    if (studentLoading || studentError) return
    if (!profile || !isStudentProfileComplete(profile)) {
      router.replace('/secured/profile')
    }
  }, [isAdmin, studentLoading, studentError, profile, router])

  const displayName =
    user?.firstName ||
    user?.username ||
    user?.primaryEmailAddress?.emailAddress ||
    'there'

  if (!isAdmin && studentLoading) {
    return (
      <PageMain>
        <div className="relative mx-auto max-w-5xl px-4 py-12 sm:px-6">
          <div className="h-10 w-64 animate-pulse rounded-lg bg-slate-200" />
          <div className="mt-8 h-64 animate-pulse rounded-2xl bg-slate-100" />
        </div>
      </PageMain>
    )
  }

  if (!isAdmin && studentError) {
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

  if (
    !isAdmin &&
    (!profile || !isStudentProfileComplete(profile))
  ) {
    return (
      <PageMain>
        <div className="relative mx-auto max-w-5xl px-4 py-16 text-center text-slate-600">
          <p>Redirecting to your profile…</p>
        </div>
      </PageMain>
    )
  }

  const checklist = profile ? getProfileChecklistItems(profile) : []
  const showStudentWidgets =
    !isAdmin && Boolean(profile) && isStudentProfileComplete(profile)

  return (
    <PageMain>
      <div className="relative mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div>
          <MemberDashboardHeader
            displayName={displayName}
            profile={profile}
            isAdmin={isAdmin}
          />
          {isAdmin && (
            <section className="mb-6 rounded-2xl border border-primary/20 bg-primary/5 p-4">
              <p className="text-sm text-slate-700">
                You are signed in as an admin. A student profile is optional for
                you — if you skip it, you will not appear on the public Students
                page. If you do fill out{' '}
                <a href="/secured/profile" className="font-medium text-primary hover:underline">
                  your profile
                </a>
                , that row is shown like any other student. Use{' '}
                <a href="/secured/admin" className="font-medium text-primary hover:underline">
                  Administration
                </a>{' '}
                to manage content.
              </p>
            </section>
          )}
          {showStudentWidgets && (
            <MemberDashboardActionItems
              assignments={assignments}
              isLoading={assignmentsLoading}
            />
          )}
          <MemberDashboardWeekSection />
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <div className="space-y-6">
              {showStudentWidgets && (
                <>
                  <MemberDashboardAssignmentsSection
                    assignments={assignments}
                    isLoading={assignmentsLoading}
                    error={assignmentsError}
                  />
                  <MemberDashboardFeedbackSection
                    assignments={assignments}
                    submissions={submissions}
                    isLoading={assignmentsLoading}
                  />
                </>
              )}
              <MemberDashboardVideosSection
                videos={videos}
                isLoading={videosLoading}
                error={videosError}
              />
              <MemberDashboardAnnouncementsSection
                announcements={announcements}
                isLoading={annLoading}
                error={annError}
              />
              {showStudentWidgets && (
                <MemberDashboardParticipationsSection
                  participations={participations}
                  isLoading={partLoading}
                  error={partError}
                />
              )}
            </div>
            <div className="space-y-6">
              {showStudentWidgets && (
                <MemberDashboardProfileChecklist items={checklist} />
              )}
              <MemberDashboardQuickLinks />
            </div>
          </div>
        </div>
      </div>
    </PageMain>
  )
}
