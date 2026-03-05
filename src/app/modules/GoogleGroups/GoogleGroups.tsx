import { Button, TextButton } from '@/atoms/button/Button'
import { useGoogleGroups } from '@/hooks/useGoogleGroups'
import { PencilIcon, TrashIcon } from 'lucide-react'
import { useMemo, useState } from 'react'
import { AddGoogleGroup } from './AddGoogleGroup'
import { DeleteGoogleGroup } from './DeleteGoogleGroup'
import { GoogleGroupFormState } from './GoogleGroup.types'

export const GoogleGroups = () => {
  const { groups, isLoading, error, refetch } = useGoogleGroups()

  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [formState, setFormState] = useState<GoogleGroupFormState | undefined>(
    undefined,
  )
  const [
    groupToDelete,
    setGroupToDelete,
  ] = useState<GoogleGroupFormState | null>(null)

  const isEditing = useMemo(() => Boolean(formState?.id), [formState?.id])

  const handleOpenCreate = () => {
    setIsFormModalOpen(true)
  }

  const handleOpenEdit = (group: GoogleGroupFormState) => {
    setFormState({
      id: group.id,
      name: group.name,
      email: group.email,
    })
    setIsFormModalOpen(true)
  }

  const handleAddOrEditSuccess = () => {
    setIsFormModalOpen(false)
    setFormState(undefined)
    refetch()
  }

  const handleDeleteSuccess = () => {
    setIsDeleteModalOpen(false)
    setGroupToDelete(null)
    refetch()
  }

  const handleOpenDelete = (group: GoogleGroupFormState) => {
    setGroupToDelete(group)
    setIsDeleteModalOpen(true)
  }

  return (
    <div className="relative">
      <div className="min-h-[500px] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-2 py-2">
        <div className="px-3 py-3">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-50">
                Google Groups
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Manage Google Groups used across the system.
              </p>
            </div>

            <Button onClick={handleOpenCreate}>Add group</Button>
          </div>

          {isLoading && (
            <div className="mb-4 rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              Loading Google Groups…
            </div>
          )}

          {error && (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              Failed to load Google Groups. {error}
            </div>
          )}

          {!isLoading && !error && groups.length === 0 && (
            <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500">
              No Google Groups configured yet.
            </div>
          )}

          {groups.length > 0 && (
            <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm">
              <table className="min-w-full divide-y divide-slate-200 bg-white">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Email
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {groups.map((group) => (
                    <tr key={group.id} className="hover:bg-slate-50/70">
                      <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-slate-900">
                        {group.name}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">
                        <a
                          href={`mailto:${group.email}`}
                          className="text-indigo-600 hover:text-indigo-800 hover:underline"
                        >
                          {group.email}
                        </a>
                      </td>
                      <td className="whitespace-nowrap text-right text-sm flex items-center justify-end gap-2">
                        <TextButton
                          variant="textTertiary"
                          onClick={() => handleOpenEdit(group)}
                        >
                          <PencilIcon className="size-4" />
                        </TextButton>
                        <TextButton
                          variant="textError"
                          onClick={() => handleOpenDelete(group)}
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

        <AddGoogleGroup
          show={isFormModalOpen}
          groupToEdit={formState ?? undefined}
          onSucess={handleAddOrEditSuccess}
        />
        <DeleteGoogleGroup
          show={isDeleteModalOpen}
          groupToDelete={groupToDelete}
          onDelete={handleDeleteSuccess}
        />
      </div>
    </div>
  )
}
