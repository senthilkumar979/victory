import 'server-only'

import { getMobileDb, MobileServiceError } from '@/lib/mobile/mobileApiUtils'

function startOfTodayUtcIso() {
  const now = new Date()
  const start = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  )
  return start.toISOString()
}

function endOfTodayUtcIso() {
  const now = new Date()
  const end = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      23,
      59,
      59,
      999,
    ),
  )
  return end.toISOString()
}

export async function getAdminDashboard() {
  const db = getMobileDb()
  const todayStart = startOfTodayUtcIso()
  const todayEnd = endOfTodayUtcIso()

  const [
    studentsCount,
    meetingsToday,
    announcements,
    assignmentsOpen,
    pendingSubmissions,
  ] = await Promise.all([
    db.from('students').select('id', { count: 'exact', head: true }),
    db
      .from('meetings')
      .select('id', { count: 'exact', head: true })
      .gte('date', todayStart)
      .lte('date', todayEnd),
    db
      .from('announcements')
      .select('id, title, description, created_at')
      .order('id', { ascending: false })
      .limit(5),
    db.from('assignments').select('id', { count: 'exact', head: true }),
    db
      .from('assignment_submissions')
      .select('id', { count: 'exact', head: true })
      .is('feedback', null),
  ])

  const errors = [
    studentsCount.error,
    meetingsToday.error,
    announcements.error,
    assignmentsOpen.error,
    pendingSubmissions.error,
  ].filter(Boolean)

  if (errors.length > 0) {
    console.error('[mobile/dashboardService]', errors)
    throw new MobileServiceError(
      'Could not load dashboard.',
      500,
      'INTERNAL_ERROR',
    )
  }

  return {
    studentCount: studentsCount.count ?? 0,
    meetingsTodayCount: meetingsToday.count ?? 0,
    openAssignmentsCount: assignmentsOpen.count ?? 0,
    pendingSubmissionsCount: pendingSubmissions.count ?? 0,
    recentAnnouncements: announcements.data ?? [],
  }
}
