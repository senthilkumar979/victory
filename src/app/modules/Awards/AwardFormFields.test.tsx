import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm } from 'react-hook-form'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { AwardFormFields } from './AwardFormFields'
import type { AwardFormValues } from './awardFormSchema'

const categoriesState = vi.hoisted(() => ({
  categories: [
    { id: 'cat-1', name: 'Excellence' },
    { name: 'Missing id' },
    { id: '', name: 'Empty id' },
  ] as { id?: string; name: string }[],
  error: null as string | null,
}))

vi.mock('@/hooks/useAwardCategories', () => ({
  useAwardCategories: () => ({
    categories: categoriesState.categories,
    isLoading: false,
    error: categoriesState.error,
    refetch: async () => {},
    createCategory: async () => {},
    updateCategory: async () => {},
    deleteCategory: async () => {},
  }),
}))

vi.mock('@/molecules/user-search/UserSearch', () => ({
  UserSearch: function UserSearchMock({
    onSelect,
  }: {
    onSelect: (student: { email: string; name: string }) => void
  }) {
    return (
      <button
        type="button"
        onClick={() =>
          onSelect({ email: 'winner@test.com', name: 'Ada Lovelace' })
        }
      >
        Pick student
      </button>
    )
  },
}))

vi.mock('@/molecules/calendar', () => ({
  CalendarInput: function CalendarInputMock({
    label,
    value,
    onChange,
  }: {
    label: string
    value: string
    onChange: (v: string) => void
  }) {
    return (
      <label>
        {label}
        <input
          aria-label={label}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </label>
    )
  },
}))

function Harness() {
  const form = useForm<AwardFormValues>({
    defaultValues: {
      awardedTo: '',
      awardedToName: '',
      awardedOn: '',
      description: '',
      awardCategoryId: '',
    },
  })

  return (
    <>
      <AwardFormFields formId="award-form" form={form} />
      <output data-testid="awarded-to">{form.watch('awardedTo')}</output>
      <output data-testid="awarded-to-name">{form.watch('awardedToName')}</output>
    </>
  )
}

afterEach(() => {
  cleanup()
  categoriesState.error = null
})

describe('AwardFormFields', () => {
  it('stores the selected student email and display name, then clears the recipient', async () => {
    const user = userEvent.setup()
    render(<Harness />)

    await user.click(screen.getByRole('button', { name: 'Pick student' }))

    expect(screen.getByText('Recipient: winner@test.com')).toBeInTheDocument()
    expect(screen.getByTestId('awarded-to')).toHaveTextContent('winner@test.com')
    expect(screen.getByTestId('awarded-to-name')).toHaveTextContent(
      'Ada Lovelace',
    )

    await user.click(screen.getByRole('button', { name: 'Clear' }))

    expect(screen.queryByText(/Recipient:/)).not.toBeInTheDocument()
    expect(screen.getByTestId('awarded-to')).toHaveTextContent('')
  })

  it('omits categories without an id and surfaces a category fetch error', () => {
    categoriesState.error = 'Could not load categories'
    render(<Harness />)

    const category = screen.getByLabelText(/Award category/)
    expect(category).toContainHTML('Excellence')
    expect(category).not.toContainHTML('Missing id')
    expect(category).not.toContainHTML('Empty id')
    expect(screen.getByText('Could not load categories')).toBeInTheDocument()
  })
})
