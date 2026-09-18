import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import type { PresenterFormState } from './Presenter.types'
import { PresentersTable } from './PresentersTable'

vi.mock('next/image', () => ({
  default: function NextImageMock({ alt }: { alt?: string }) {
    return <span data-alt={alt} />
  },
}))

vi.mock('@/templates/StudentBatch', () => ({
  StudentBatch: ({ batch }: { batch: number }) => (
    <span>batch-num:{batch}</span>
  ),
}))

const handlers = {
  onEdit: vi.fn(),
  onDelete: vi.fn(),
}

const withPicture: PresenterFormState = {
  id: 'presenter-1',
  presentedBy: 'ada@mentorbridge.in',
  presentedDate: '2026-06-15T00:00:00.000Z',
  topic: 'Graph algorithms',
  student: {
    name: 'Ada Lovelace',
    picture: 'https://cdn.example/ada.jpg',
    batch: 2026,
  },
}

const missingStudent: PresenterFormState = {
  id: 'presenter-2',
  presentedBy: 'retired@mentorbridge.in',
  presentedDate: 'not-a-date',
  topic: '',
}

const noPictureAlumni: PresenterFormState = {
  id: 'presenter-3',
  presentedBy: 'grace@mentorbridge.in',
  presentedDate: '   ',
  topic: 'Compilers',
  student: {
    name: 'Grace Hopper',
    picture: '',
    batch: 'alumni',
  },
}

const emptyPresenter: PresenterFormState = {
  id: 'presenter-4',
  presentedBy: '',
  presentedDate: '',
  topic: '',
}

function rowFor(text: string) {
  const row = screen.getByText(text).closest('tr')
  if (!(row instanceof HTMLElement)) throw new Error(`row missing for ${text}`)
  return row
}

afterEach(() => {
  cleanup()
})

describe('PresentersTable', () => {
  it('falls back when the student is missing, the picture is empty, or fields are blank', () => {
    render(
      <PresentersTable
        presenters={[withPicture, missingStudent, noPictureAlumni, emptyPresenter]}
        {...handlers}
      />,
    )

    const adaRow = rowFor('Ada Lovelace')
    expect(within(adaRow).getByText('ada@mentorbridge.in')).toBeInTheDocument()
    expect(within(adaRow).getByText('batch-num:2026')).toBeInTheDocument()
    expect(within(adaRow).getByText('Jun 15, 2026')).toBeInTheDocument()
    expect(within(adaRow).getByText('Graph algorithms')).toBeInTheDocument()
    expect(adaRow.querySelector('[data-alt="Ada Lovelace"]')).not.toBeNull()

    const missingRow = rowFor('retired@mentorbridge.in')
    expect(within(missingRow).queryByText('Ada Lovelace')).not.toBeInTheDocument()
    expect(within(missingRow).queryByText('A')).not.toBeInTheDocument()
    expect(within(missingRow).getByText('not-a-date')).toBeInTheDocument()
    expect(within(missingRow).getByText('—')).toBeInTheDocument()

    const graceRow = rowFor('Grace Hopper')
    expect(within(graceRow).getByText('G')).toBeInTheDocument()
    expect(within(graceRow).getByText('Batch alumni')).toBeInTheDocument()
    expect(within(graceRow).getAllByText('—').length).toBeGreaterThan(0)

    const emptyRow = screen.getAllByRole('row')[4]
    expect(within(emptyRow).getAllByText('—').length).toBeGreaterThanOrEqual(3)
  })

  it('invokes edit and delete from the matching presenter row', async () => {
    const user = userEvent.setup()
    render(<PresentersTable presenters={[withPicture]} {...handlers} />)

    const buttons = within(rowFor('Ada Lovelace')).getAllByRole('button')
    await user.click(buttons[0])
    expect(handlers.onEdit).toHaveBeenCalledWith(withPicture)

    await user.click(buttons[1])
    expect(handlers.onDelete).toHaveBeenCalledWith(withPicture)
  })
})
