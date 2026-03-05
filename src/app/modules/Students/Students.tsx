'use client'

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useMemo } from 'react'

import { useStudents } from '@/hooks/useStudents'
import { SocialLinks } from '@/templates/SocialLinks'
import { StudentBatch } from '@/templates/StudentBatch'
import type { ProfileData } from '@/types/student.types'
import { StudentRole } from '../../../ui/templates/StudentRole'

export const Students = () => {
  const { students, loading, error } = useStudents()

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

  const table = useReactTable({
    data: students,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 px-6 py-8">
      <div className="mx-auto max-w-6xl rounded-2xl bg-white/80 p-6 shadow-lg ring-1 ring-slate-100 backdrop-blur">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Students</h2>
            <p className="mt-1 text-sm text-slate-500">
              Directory of students with their current roles, batches,
              companies, and socials.
            </p>
          </div>
          {loading && (
            <span className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
              Loading…
            </span>
          )}
        </div>

        {error && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            Failed to load students. {error}
          </div>
        )}

        {!loading && !error && students.length === 0 && (
          <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500">
            No students found.
          </div>
        )}

        {students.length > 0 && (
          <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm">
            <table className="min-w-full divide-y divide-slate-200 bg-white">
              <thead className="bg-slate-50">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="divide-y divide-slate-100">
                {table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-l-2 hover:bg-slate-50/70 hover:border-l-2 hover:border-l-primary"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="whitespace-nowrap px-4 py-3 align-middle"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
