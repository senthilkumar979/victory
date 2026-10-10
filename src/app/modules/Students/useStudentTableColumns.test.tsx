import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { CellContext, ColumnDef } from '@tanstack/react-table'
import { afterEach, describe, expect, it, vi } from 'vitest'

import type { ProfileData } from '@/types/student.types'

import { useStudentTableColumns } from './useStudentTableColumns'

afterEach(() => {
  cleanup()
})

const baseStudent = {
  id: 'student-1',
  name: 'ada',
  picture: '',
  role: 'Frontend Engineer',
  email: 'ada@example.com',
  batch: '2026',
} as ProfileData

const ColumnCell = ({
  student,
  columnId,
  onRowClick,
}: {
  student: ProfileData
  columnId: string
  onRowClick?: () => void
}) => {
  const { columns } = useStudentTableColumns()
  const column = columns.find((entry) => {
    const keyed = entry as ColumnDef<ProfileData> & { accessorKey?: string }
    return keyed.accessorKey === columnId || keyed.id === columnId
  })
  const renderCell = column?.cell

  if (typeof renderCell !== 'function') return null

  const value =
    columnId === 'socialLinks' ? student.socialLinks : student[columnId as keyof ProfileData]

  return (
    <div onClick={onRowClick}>
      {renderCell({
        row: { original: student },
        getValue: () => value,
      } as CellContext<ProfileData, unknown>)}
    </div>
  )
}

describe('useStudentTableColumns', () => {
  it('uses the uppercased initial when the student has no picture', () => {
    render(<ColumnCell student={baseStudent} columnId="name" />)

    expect(screen.getByText('A')).toBeInTheDocument()
    expect(screen.queryByRole('img')).toBeNull()
  })

  it('builds a mailto link whose click does not select the row', async () => {
    const user = userEvent.setup()
    const onRowClick = vi.fn()

    render(
      <ColumnCell
        student={baseStudent}
        columnId="email"
        onRowClick={onRowClick}
      />,
    )

    const email = screen.getByRole('link', { name: 'ada@example.com' })
    expect(email).toHaveAttribute('href', 'mailto:ada@example.com')
    email.addEventListener('click', (event) => event.preventDefault())
    await user.click(email)
    expect(onRowClick).not.toHaveBeenCalled()
  })

  it('omits social links when the profile has none, and stops row selection when they exist', async () => {
    const user = userEvent.setup()
    const onRowClick = vi.fn()
    const { rerender } = render(
      <ColumnCell student={baseStudent} columnId="socialLinks" />,
    )

    expect(screen.queryByRole('link', { name: 'LinkedIn profile' })).toBeNull()

    rerender(
      <ColumnCell
        student={{
          ...baseStudent,
          socialLinks: {
            linkedIn: 'https://www.linkedin.com/in/ada',
            gitHub: 'https://github.com/ada',
          },
        }}
        columnId="socialLinks"
        onRowClick={onRowClick}
      />,
    )

    const linkedIn = screen.getByRole('link', { name: 'LinkedIn profile' })
    linkedIn.addEventListener('click', (event) => event.preventDefault())
    await user.click(linkedIn)
    expect(onRowClick).not.toHaveBeenCalled()
  })

  it('shows the photo instead of the initial when a picture url is present', () => {
    render(
      <ColumnCell
        student={{ ...baseStudent, picture: 'https://cdn.example/ada.png' }}
        columnId="name"
      />,
    )

    expect(screen.getByRole('img', { name: 'ada' })).toHaveAttribute(
      'src',
      'https://cdn.example/ada.png',
    )
    expect(screen.queryByText('A')).toBeNull()
  })
})
