'use client'

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useState } from 'react'

import { Button } from '@/atoms/button/Button'
import { useStudents } from '@/hooks/useStudents'
import { InviteStudent } from './InviteStudent'
import { useStudentTableColumns } from './useStudentTableColumns'

export const Students = () => {
  const { students, loading, error, refetch } = useStudents()
  const { columns } = useStudentTableColumns()
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)

  const table = useReactTable({
    data: students,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  const handleInviteStudents = () => {
    setIsInviteModalOpen(true)
  }

  return (
    <div className="min-h-screen px-6 py-4">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="mb-6 border-l-3 border-primary pl-4">
          <h2 className="text-lg font-semibold text-slate-50">Students</h2>
          <p className="mt-1 text-sm text-slate-500">
            Directory of students with their current roles, batches, companies,
            and social links.
          </p>
        </div>
        <Button onClick={handleInviteStudents}>Invite Student</Button>
      </div>
      <InviteStudent
        show={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onSuccess={refetch}
      />
      <div className="">
        <div className="mb-6 flex items-center justify-between gap-4">
          {loading && (
            <div className="mb-4 rounded-md border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-300 w-full">
              Loading students …
            </div>
          )}
        </div>

        {error && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 w-full">
            Failed to load students. {error}
          </div>
        )}

        {!loading && !error && students.length === 0 && (
          <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500 w-full">
            No students found.
          </div>
        )}

        {students.length > 0 && (
          <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/80 shadow-[0_18px_45px_rgba(15,23,42,0.08)] ring-1 ring-slate-100/70">
            <table className="min-w-full divide-y divide-slate-200/70 bg-white/90">
              <thead className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800 text-slate-100">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        scope="col"
                        className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-300 first:pl-5 last:pr-5"
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
              <tbody className="divide-y divide-slate-100/70 bg-slate-50/40">
                {table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="group border-l-2 border-transparent bg-white/40 transition-colors duration-150 odd:bg-white/60 even:bg-slate-50/60 hover:border-l-primary hover:bg-sky-50/80"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="whitespace-nowrap px-4 py-3 align-middle text-sm text-slate-800 first:pl-5 last:pr-5 group-hover:text-slate-900"
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
