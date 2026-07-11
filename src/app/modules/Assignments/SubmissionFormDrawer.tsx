'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Check, XIcon } from 'lucide-react'
import { gooeyToast } from 'goey-toast'

import { SubmissionFormFields } from './SubmissionFormFields'
import {
  submissionFormSchema,
  type SubmissionFormValues,
} from '@/lib/assignments/assignmentSchemas'
import type { AssignmentSubmission } from '@/types/assignment.types'
import { Button } from '@/atoms/button/Button'
import { Drawer } from '@/ui/organisms/drawer/Drawer'

const toFormValues = (s: AssignmentSubmission | null): SubmissionFormValues => ({
  googleDocUrl: s?.googleDocUrl ?? '',
  githubRepoUrl: s?.githubRepoUrl ?? '',
})

interface SubmissionFormDrawerProps {
  isOpen: boolean
  assignmentId: string
  submission?: AssignmentSubmission | null
  readOnly?: boolean
  onClose: () => void
  onSuccess: () => void
}

export const SubmissionFormDrawer = ({
  isOpen,
  assignmentId,
  submission,
  readOnly = false,
  onClose,
  onSuccess,
}: SubmissionFormDrawerProps) => {
  const form = useForm<SubmissionFormValues>({
    resolver: zodResolver(submissionFormSchema),
    mode: 'onChange',
    defaultValues: toFormValues(null),
  })
  const { reset } = form

  const formResetKey = useMemo(
    () => (!isOpen ? 'closed' : (submission?.id ?? 'new')) as string,
    [isOpen, submission?.id],
  )
  const submissionRef = useRef(submission)
  submissionRef.current = submission

  useEffect(() => {
    if (!isOpen) return
    reset(toFormValues(submissionRef.current ?? null))
  }, [isOpen, formResetKey, reset])

  const handleSubmit = form.handleSubmit(async (data) => {
    if (readOnly) return
    try {
      const res = await fetch(`/api/assignments/${assignmentId}/my-submission`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const body = await res.json()
      if (!res.ok) throw new Error(body.error ?? 'Failed to save submission')

      gooeyToast.success('Submission saved successfully.')
      onSuccess()
    } catch (err) {
      gooeyToast.error('Failed to save submission.', {
        description: err instanceof Error ? err.message : 'Please try again.',
      })
    }
  })

  return (
    <Drawer isOpen={isOpen} onClose={onClose} size="xxl">
      <Drawer.Title description="Submit at least one link — Google Doc, GitHub repository, or both.">
        {submission ? 'Edit submission' : 'Submit assignment'}
      </Drawer.Title>
      <Drawer.Body>
        {readOnly && (
          <p className="mb-4 text-sm text-amber-300">
            Submission deadline has passed.
          </p>
        )}
        <form id="submission-form" className="space-y-4" onSubmit={handleSubmit}>
          <SubmissionFormFields
            formId="submission-form"
            form={form}
            readOnly={readOnly}
          />
        </form>
      </Drawer.Body>
      <Drawer.Footer>
        <Button variant="secondary" size="sm" onClick={onClose}>
          <XIcon className="h-4 w-4" /> Cancel
        </Button>
        {!readOnly && (
          <Button variant="primary" size="sm" type="submit" form="submission-form">
            <Check className="h-4 w-4" /> Save
          </Button>
        )}
      </Drawer.Footer>
    </Drawer>
  )
}
