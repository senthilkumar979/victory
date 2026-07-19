import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { AssignmentFormFields } from './AssignmentFormFields'
import {
  assignmentFormSchema,
  type AssignmentFormValues,
} from '@/lib/assignments/assignmentSchemas'
import { ASSIGNMENT_CATEGORIES } from '@/lib/assignments/assignmentCategories'

vi.mock('@/components/assignments/MarkdownEditor', () => ({
  MarkdownEditor: ({
    value,
    onChange,
  }: {
    value: string
    onChange: (v: string) => void
  }) => (
    <textarea
      aria-label="Description"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  ),
}))

const cohortId = '11111111-1111-4111-8111-111111111111'

const validBaseValues: AssignmentFormValues = {
  title: '',
  description: 'Starter description',
  cohortId,
  category: ASSIGNMENT_CATEGORIES[0],
  googleGroupId: 'team@test.com',
  attachments: '',
  dueDate: '2026-06-15T10:00:00.000Z',
}

function AssignmentFormTestHarness({
  isOpen = true,
  onValidSubmit,
}: {
  isOpen?: boolean
  onValidSubmit: (data: AssignmentFormValues) => void
}) {
  const form = useForm<AssignmentFormValues>({
    resolver: zodResolver(assignmentFormSchema),
    defaultValues: validBaseValues,
  })
  const { reset, handleSubmit } = form

  useEffect(() => {
    if (!isOpen) return
    reset(validBaseValues)
  }, [isOpen, reset])

  if (!isOpen) return null

  return (
    <>
      <form id="assignment-form" onSubmit={handleSubmit(onValidSubmit)}>
        <AssignmentFormFields
          formId="assignment-form"
          form={form}
          cohorts={[{ id: cohortId, name: 'Cohort A' }]}
          googleGroups={[{ id: 'g1', name: 'Team', email: 'team@test.com' }]}
        />
      </form>
      <button type="submit" form="assignment-form">
        Save
      </button>
    </>
  )
}

afterEach(() => {
  cleanup()
})

describe('AssignmentFormFields', () => {
  it('submits filled title from controlled FormInput after drawer reset', async () => {
    const user = userEvent.setup()
    const onValidSubmit = vi.fn()

    const { rerender } = render(
      <AssignmentFormTestHarness isOpen={false} onValidSubmit={onValidSubmit} />,
    )

    rerender(
      <AssignmentFormTestHarness isOpen={true} onValidSubmit={onValidSubmit} />,
    )

    await user.type(
      screen.getByPlaceholderText('Assignment title'),
      'Week 3 homework',
    )

    await user.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(onValidSubmit).toHaveBeenCalledTimes(1)
    })

    expect(onValidSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Week 3 homework',
        description: 'Starter description',
        cohortId,
        googleGroupId: 'team@test.com',
      }),
      expect.anything(),
    )
  })
})
