'use client'

import { gooeyToast } from 'goey-toast'

import type { AssignmentListItem } from '@/types/assignment.types'
import { Button } from '@/atoms/button/Button'

interface DeleteAssignmentProps {
  show: boolean
  assignment: AssignmentListItem | null
  onClose: () => void
  onDeleted: () => void
}

export const DeleteAssignment = ({
  show,
  assignment,
  onClose,
  onDeleted,
}: DeleteAssignmentProps) => {
  if (!show || !assignment) return null

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/assignments/${assignment.id}`, {
        method: 'DELETE',
      })
      const body = await res.json()
      if (!res.ok) throw new Error(body.error ?? 'Delete failed')
      gooeyToast.success('Assignment deleted.')
      onDeleted()
    } catch (err) {
      gooeyToast.error('Failed to delete assignment.', {
        description: err instanceof Error ? err.message : undefined,
      })
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/80 p-4">
      <div className="w-full max-w-md rounded-lg border border-slate-700 bg-slate-900 p-5">
        <h3 className="text-lg font-semibold text-slate-100">Delete assignment?</h3>
        <p className="mt-2 text-sm text-slate-400">
          This will permanently delete &quot;{assignment.title}&quot; and all
          submissions.
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="error" size="sm" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </div>
    </div>
  )
}
