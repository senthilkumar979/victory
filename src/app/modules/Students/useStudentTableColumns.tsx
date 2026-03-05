import { SocialLinks } from '@/templates/SocialLinks'
import { StudentBatch } from '@/templates/StudentBatch'
import { StudentRole } from '@/templates/StudentRole'
import { ProfileData } from '@/types/student.types'
import { ColumnDef } from '@tanstack/react-table'
import { useMemo } from 'react'

export const useStudentTableColumns = () => {
  const columns: ColumnDef<ProfileData>[] = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
        cell: (info) => (
          <div className="flex flex-col">
            <span className="text-sm font-sm font-medium text-slate-900 uppercase">
              {info.getValue<string>()}
            </span>
          </div>
        ),
      },
      {
        accessorKey: 'email',
        header: 'Email',
        cell: (info) => {
          const email = info.getValue<string>()
          return (
            <a
              href={`mailto:${email}`}
              className="text-sm text-indigo-600 hover:text-indigo-800 hover:underline"
            >
              {email}
            </a>
          )
        },
      },
      {
        accessorKey: 'role',
        header: 'Role',
        cell: (info) => <StudentRole role={info.getValue<string>()} />,
      },
      {
        accessorKey: 'batch',
        header: 'Batch',
        cell: (info) => <StudentBatch batch={info.getValue<number>()} />,
      },
      {
        id: 'socialLinks',
        header: 'Social',
        cell: (info) => {
          const links = info.row.original.socialLinks
          if (!links) return null
          return <SocialLinks socialLinks={links} />
        },
      },
    ],
    [],
  )

  return {
    columns,
  }
}
