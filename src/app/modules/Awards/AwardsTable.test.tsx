import { cleanup, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import type { AwardFormState } from './Award.types'
import { AwardsTable } from './AwardsTable'

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

vi.mock('./AwardRowActions', () => ({
  AwardRowActions: function AwardRowActionsMock({
    award,
  }: {
    award: AwardFormState
  }) {
    return <span>actions:{award.id ?? 'none'}</span>
  },
}))

const handlers = {
  onEdit: vi.fn(),
  onDelete: vi.fn(),
  onPublishToLinkedIn: vi.fn(),
  onSendAwardEmail: vi.fn(),
}

const withPicture: AwardFormState = {
  id: 'award-1',
  awardedTo: 'ada@mentorbridge.in',
  awardedOn: '2026-06-15T00:00:00.000Z',
  description: '<p>Shipped the <strong>mentor</strong> portal</p>',
  awardCategoryId: 'cat-1',
  student: {
    name: 'Ada Lovelace',
    picture: 'https://cdn.example/ada.jpg',
    batch: 2026,
  },
}

const missingStudent: AwardFormState = {
  id: 'award-2',
  awardedTo: 'retired@mentorbridge.in',
  awardedOn: 'not-a-date',
  description: '',
  awardCategoryId: '',
}

const noPictureAlumni: AwardFormState = {
  id: 'award-3',
  awardedTo: 'grace@mentorbridge.in',
  awardedOn: '   ',
  description: '',
  awardCategoryId: 'missing-cat',
  student: {
    name: 'Grace Hopper',
    picture: '',
    batch: 'alumni',
  },
}

const emptyRecipient: AwardFormState = {
  id: 'award-4',
  awardedTo: '',
  awardedOn: '',
  description: '',
  awardCategoryId: '',
}

function rowFor(text: string) {
  const row = screen.getByText(text).closest('tr')
  if (!(row instanceof HTMLElement)) throw new Error(`row missing for ${text}`)
  return row
}

afterEach(() => {
  cleanup()
})

describe('AwardsTable', () => {
  it('falls back when the student is missing, the picture is empty, or the category is unknown', () => {
    render(
      <AwardsTable
        awards={[withPicture, missingStudent, noPictureAlumni, emptyRecipient]}
        categoryNameById={{ 'cat-1': 'Impact' }}
        {...handlers}
      />,
    )

    const adaRow = rowFor('Ada Lovelace')
    expect(within(adaRow).getByText('ada@mentorbridge.in')).toBeInTheDocument()
    expect(within(adaRow).getByText('batch-num:2026')).toBeInTheDocument()
    expect(within(adaRow).getByText('Jun 15, 2026')).toBeInTheDocument()
    expect(within(adaRow).getByText('Impact')).toBeInTheDocument()
    expect(within(adaRow).getByText(/Shipped the/)).toHaveTextContent(
      'Shipped the mentor portal',
    )
    expect(adaRow.querySelector('[data-alt="Ada Lovelace"]')).not.toBeNull()

    const missingRow = rowFor('retired@mentorbridge.in')
    expect(within(missingRow).queryByText('Ada Lovelace')).not.toBeInTheDocument()
    expect(within(missingRow).queryByText('A')).not.toBeInTheDocument()
    expect(within(missingRow).getByText('not-a-date')).toBeInTheDocument()
    expect(within(missingRow).getAllByText('—').length).toBeGreaterThan(0)

    const graceRow = rowFor('Grace Hopper')
    expect(within(graceRow).getByText('G')).toBeInTheDocument()
    expect(within(graceRow).getByText('Batch alumni')).toBeInTheDocument()
    expect(within(graceRow).getAllByText('—').length).toBeGreaterThan(0)

    const emptyRow = rowFor('actions:award-4').closest('tr')
    expect(emptyRow).not.toBeNull()
    expect(within(emptyRow as HTMLElement).getAllByText('—').length).toBeGreaterThan(
      0,
    )
  })
})
