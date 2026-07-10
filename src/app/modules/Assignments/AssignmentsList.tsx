'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'

import { useAssignments } from '@/hooks/useAssignments'
import { Button } from '@/atoms/button/Button'
import { AssignmentCard } from './AssignmentCard'
import { AssignmentFormDrawer } from './AssignmentFormDrawer'
import { DeleteAssignment } from './DeleteAssignment'
import type { AssignmentFormState, AssignmentListItem } from '@/types/assignment.types'

interface AssignmentsListProps {
  /** When true, always show admin CRUD actions (General Settings panel). */
  adminPanel?: boolean
}

export const AssignmentsList = ({ adminPanel = false }: AssignmentsListProps) => {
  const { assignments, isAdmin, isLoading, error, refetch } = useAssignments()
  const showAdminActions = adminPanel || isAdmin
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [formState, setFormState] = useState<AssignmentFormState | undefined>()
  const [toDelete, setToDelete] = useState<AssignmentListItem | null>(null)

  const openCreate = () => {
    setFormState(undefined)
    setIsFormOpen(true)
  }

  const openEdit = (a: AssignmentListItem) => {
    setFormState({
      id: a.id,
      title: a.title,
      description: a.description,
      cohortId: a.cohortId,
      category: a.category,
      googleGroupId: a.googleGroupId,
      attachments: a.attachments ?? '',
      dueDate: a.dueDate,
    })
    setIsFormOpen(true)
  }

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-100">Assignments</h2>
          <p className="text-sm text-slate-400">
            {adminPanel
              ? 'Create and manage cohort assignments.'
              : 'View and submit cohort assignments.'}
          </p>
        </div>
        {showAdminActions && (
          <Button variant="primary" size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4" /> Create Assignment
          </Button>
        )}
      </div>

      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-40 animate-pulse rounded-xl border border-slate-800 bg-slate-900/50"
            />
          ))}
        </div>
      )}

      {error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-300">
          {error}
        </p>
      )}

      {!isLoading && !error && assignments.length === 0 && (
        <p className="text-center text-slate-400">No assignments yet.</p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {assignments.map((a) => (
          <AssignmentCard
            key={a.id}
            assignment={a}
            isAdmin={showAdminActions}
            onEdit={showAdminActions ? openEdit : undefined}
            onDelete={
              showAdminActions
                ? (item) => {
                    setToDelete(item)
                    setIsDeleteOpen(true)
                  }
                : undefined
            }
          />
        ))}
      </div>

      <AssignmentFormDrawer
        isOpen={isFormOpen}
        assignmentToEdit={formState}
        onClose={() => setIsFormOpen(false)}
        onSuccess={() => {
          setIsFormOpen(false)
          refetch()
        }}
      />

      <DeleteAssignment
        show={isDeleteOpen}
        assignment={toDelete}
        onClose={() => setIsDeleteOpen(false)}
        onDeleted={() => {
          setIsDeleteOpen(false)
          refetch()
        }}
      />
    </>
  )
}
