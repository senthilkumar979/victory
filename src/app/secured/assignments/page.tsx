'use client'

import { useCheckIsAuthenticated } from '@/hooks/useCheckIsAuthenticated'
import { AssignmentsPage } from '@/app/modules/Assignments/AssignmentsPage'

export default function SecuredAssignmentsPage() {
  useCheckIsAuthenticated()
  return <AssignmentsPage />
}
