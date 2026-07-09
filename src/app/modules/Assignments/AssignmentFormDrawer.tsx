'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Check, XIcon } from 'lucide-react'
import { gooeyToast } from 'goey-toast'

import { AssignmentFormFields } from './AssignmentFormFields'
import type { AssignmentFormState } from '@/types/assignment.types'
import {
  assignmentFormSchema,
  type AssignmentFormValues,
} from '@/lib/assignments/assignmentSchemas'
import { useCohorts } from '@/hooks/useCohorts'
import { useGoogleGroups } from '@/hooks/useGoogleGroups'
import { Button } from '@/atoms/button/Button'
import { Drawer } from '@/ui/organisms/drawer/Drawer'

const toFormValues = (a: AssignmentFormState | null): AssignmentFormValues => ({
  title: a?.title ?? '',
  description: a?.description ?? '',
  cohortId: a?.cohortId ?? '',
  googleGroupId: a?.googleGroupId ?? '',
  attachments: a?.attachments ?? '',
  dueDate: a?.dueDate ?? '',
})

interface AssignmentFormDrawerProps {
  isOpen: boolean
  assignmentToEdit?: AssignmentFormState
  onClose: () => void
  onSuccess: () => void
}

export const AssignmentFormDrawer = ({
  isOpen,
  assignmentToEdit,
  onClose,
  onSuccess,
}: AssignmentFormDrawerProps) => {
  const { cohorts } = useCohorts()
  const { groups } = useGoogleGroups()
  const form = useForm<AssignmentFormValues>({
    resolver: zodResolver(assignmentFormSchema),
    defaultValues: toFormValues(null),
  })
  const { reset } = form

  const formResetKey = useMemo(
    () => (!isOpen ? 'closed' : (assignmentToEdit?.id ?? 'create')) as string,
    [isOpen, assignmentToEdit?.id],
  )
  const editRef = useRef(assignmentToEdit)
  editRef.current = assignmentToEdit

  useEffect(() => {
    if (!isOpen) return
    reset(toFormValues(editRef.current ?? null))
  }, [isOpen, formResetKey, reset])

  const isEditing = Boolean(assignmentToEdit?.id)

  const handleSubmit = form.handleSubmit(async (data) => {
    try {
      const res = await fetch(
        isEditing ? `/api/assignments/${assignmentToEdit?.id}` : '/api/assignments',
        {
          method: isEditing ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        },
      )
      const body = await res.json()
      if (!res.ok) throw new Error(body.error ?? 'Failed to save')

      gooeyToast.success('Assignment saved successfully.')
      onSuccess()
    } catch (err) {
      gooeyToast.error('Failed to save assignment.', {
        description: err instanceof Error ? err.message : 'Please try again.',
      })
    }
  })

  return (
    <Drawer isOpen={isOpen} onClose={onClose} size="xxl">
      <Drawer.Title
        description={
          isEditing
            ? 'Update assignment details and notify the group.'
            : 'Create a new assignment for a cohort.'
        }
      >
        {isEditing ? 'Edit assignment' : 'Create assignment'}
      </Drawer.Title>
      <Drawer.Body>
        <form id="assignment-form" className="space-y-4" onSubmit={handleSubmit}>
          <AssignmentFormFields
            formId="assignment-form"
            form={form}
            cohorts={cohorts}
            googleGroups={groups}
          />
        </form>
      </Drawer.Body>
      <Drawer.Footer>
        <Button variant="secondary" size="sm" onClick={onClose}>
          <XIcon className="h-4 w-4" /> Cancel
        </Button>
        <Button variant="primary" size="sm" type="submit" form="assignment-form">
          <Check className="h-4 w-4" /> Save
        </Button>
      </Drawer.Footer>
    </Drawer>
  )
}
