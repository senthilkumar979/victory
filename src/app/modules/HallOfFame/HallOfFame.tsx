'use client'

import { format } from 'date-fns'

import { Button, TextButton } from '@/atoms/button/Button'
import { useHallOfFame } from '@/hooks/useHallOfFame'
import { StudentBatch } from '@/templates/StudentBatch'
import { TrashIcon } from 'lucide-react'
import { useState } from 'react'

import type { HallOfFameEntry } from './HallOfFame.types'
import { DeleteHallOfFameEntry } from './DeleteHallOfFameEntry'
import { HallOfFameFormDrawer } from './HallOfFameFormDrawer'

const BatchDisplay = ({
  batch,
}: {
  batch: string | number
}) => {
  const num =
    typeof batch === 'number' ? batch : Number(batch)
  return !Number.isNaN(num) ? (
    <StudentBatch batch={num} />
  ) : (
    <span className="text-xs text-slate-500">Batch {String(batch)}</span>
  )
}

const formatInductionDate = (isoString: string): string => {
  try {
    const date = new Date(isoString)
    if (Number.isNaN(date.getTime())) return isoString
    return format(date, 'MMM d, yyyy')
  } catch {
    return isoString
  }
}

export const HallOfFame = () => {
  const { entries, isLoading, error, refetch } = useHallOfFame()
  const [isFormDrawerOpen, setIsFormDrawerOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [entryToDelete, setEntryToDelete] = useState<HallOfFameEntry | null>(
    null,
  )

  const handleAddSuccess = () => {
    setIsFormDrawerOpen(false)
    refetch()
  }

  const handleDeleteSuccess = () => {
    setIsDeleteModalOpen(false)
    setEntryToDelete(null)
    refetch()
  }

  const handleOpenDelete = (entry: HallOfFameEntry) => {
    setEntryToDelete(entry)
    setIsDeleteModalOpen(true)
  }

  return (
    <div className="relative">
      <div className="min-h-[500px] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-2 py-2">
        <div className="px-3 py-3">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div className="border-l-3 border-primary pl-4">
              <h2 className="text-lg font-semibold text-slate-50">
                Hall of Fame
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Induct students into the Hall of Fame with their induction date.
              </p>
            </div>

            <Button onClick={() => setIsFormDrawerOpen(true)}>
              Add to Hall of Fame
            </Button>
          </div>

          {isLoading && (
            <div className="mb-4 w-full rounded-md border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-300">
              Loading entries…
            </div>
          )}

          {error && (
            <div className="mb-4 w-full rounded-md border border-red-500/40 bg-red-950/50 px-4 py-3 text-sm text-red-100">
              Failed to load entries. {error}
            </div>
          )}

          {!isLoading && !error && entries.length === 0 && (
            <div className="flex h-32 w-full items-center justify-center rounded-xl border border-dashed border-slate-800 bg-slate-900/70 text-sm text-slate-400">
              No Hall of Fame entries yet.
            </div>
          )}

          {entries.length > 0 && (
            <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm">
              <table className="min-w-full divide-y divide-slate-200 bg-white">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Student
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Date of Induction
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {entries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-slate-50/70">
                      <td className="px-4 py-3">
                        <div className="flex flex-row items-center justify-start gap-3">
                          {entry.student ? (
                            <>
                              {entry.student.picture ? (
                                <img
                                  src={entry.student.picture}
                                  alt={entry.student.name}
                                  className="h-10 w-10 shrink-0 rounded-full object-cover"
                                  loading="lazy"
                                />
                              ) : (
                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-primary text-primary">
                                  {entry.student.name.charAt(0).toUpperCase()}
                                </span>
                              )}
                              <div className="flex flex-col gap-0.5">
                                <span className="text-sm font-medium text-slate-900">
                                  {entry.student.name}
                                </span>
                                <span className="text-xs text-slate-500">
                                  {entry.student_email}
                                </span>
                                {entry.student.batch != null &&
                                  entry.student.batch !== '' && (
                                  <BatchDisplay batch={entry.student.batch} />
                                )}
                              </div>
                            </>
                          ) : (
                            <span className="text-sm text-slate-600">
                              {entry.student_email}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-900">
                        {formatInductionDate(entry.date_of_induction)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right text-sm">
                        <TextButton
                          variant="textError"
                          onClick={() => handleOpenDelete(entry)}
                        >
                          <TrashIcon className="size-4" />
                        </TextButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <HallOfFameFormDrawer
          isOpen={isFormDrawerOpen}
          onClose={() => setIsFormDrawerOpen(false)}
          onSuccess={handleAddSuccess}
        />

        <DeleteHallOfFameEntry
          show={isDeleteModalOpen}
          entryToDelete={entryToDelete}
          onClose={() => {
            setIsDeleteModalOpen(false)
            setEntryToDelete(null)
          }}
          onDelete={handleDeleteSuccess}
        />
      </div>
    </div>
  )
}
