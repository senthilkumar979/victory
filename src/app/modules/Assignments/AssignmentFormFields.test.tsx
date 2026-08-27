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
const directoryGroup = { id: 'g1', name: 'Team', email: 'team@test.com' }

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
  values = validBaseValues,
  googleGroups = [directoryGroup],
}: {
  isOpen?: boolean
  onValidSubmit: (data: AssignmentFormValues) => void
  values?: AssignmentFormValues
  googleGroups?: { id?: string; name: string; email: string }[]
}) {
  const form = useForm<AssignmentFormValues>({
    resolver: zodResolver(assignmentFormSchema),
    defaultValues: values,
  })
  const { reset, handleSubmit } = form

  useEffect(() => {
    if (!isOpen) return
    reset(values)
  }, [isOpen, reset, values])

  if (!isOpen) return null

  return (
    <>
      <form id="assignment-form" onSubmit={handleSubmit(onValidSubmit)}>
        <AssignmentFormFields
          formId="assignment-form"
          form={form}
          cohorts={[{ id: cohortId, name: 'Cohort A' }]}
          googleGroups={googleGroups}
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

  it('rewrites a stored google_groups.id to the directory email', async () => {
    render(
      <AssignmentFormTestHarness
        onValidSubmit={vi.fn()}
        values={{ ...validBaseValues, googleGroupId: 'g1' }}
      />,
    )

    await waitFor(() => {
      expect(screen.getByLabelText(/Google Group/)).toHaveValue('team@test.com')
    })
    expect(
      screen.queryByRole('option', { name: /not in directory/ }),
    ).not.toBeInTheDocument()
  })

  it('keeps an unknown group value as an orphan option', () => {
    render(
      <AssignmentFormTestHarness
        onValidSubmit={vi.fn()}
        values={{ ...validBaseValues, googleGroupId: 'retired@old.com' }}
      />,
    )

    expect(screen.getByLabelText(/Google Group/)).toHaveValue('retired@old.com')
    expect(
      screen.getByRole('option', { name: /retired@old.com \(not in directory\)/ }),
    ).toBeInTheDocument()
  })
})
