'use client'

import { use } from 'react'

import { AssignmentDetailPage } from '@/app/modules/Assignments/AssignmentDetailPage'
import { useCheckIsAuthenticated } from '@/hooks/useCheckIsAuthenticated'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function SecuredAssignmentDetailPage({ params }: PageProps) {
  useCheckIsAuthenticated()
  const { id } = use(params)
  return <AssignmentDetailPage assignmentId={id} />
}
