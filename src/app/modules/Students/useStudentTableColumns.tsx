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
        cell: ({ row }) => (
          <div className="flex flex-row items-center justify-start gap-2">
            {row.original.picture ? (
              <img
                src={row.original.picture}
                alt={row.original.name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <span className="w-10 h-10 rounded-full object-cover flex items-center justify-center border-primary border-2 text-primary">
                {row.original.name.charAt(0).toUpperCase()}
              </span>
            )}
            <span className="text-sm font-sm font-medium text-slate-900 uppercase">
              {row.original.name}
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
