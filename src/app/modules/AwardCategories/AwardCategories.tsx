import { Button, TextButton } from '@/atoms/button/Button'
import { useAwardCategories } from '@/hooks/useAwardCategories'
import { PencilIcon, TrashIcon } from 'lucide-react'
import { useState } from 'react'
import { AddAwardCategory } from './AddAwardCategory'
import { AwardCategoryFormState } from './AwardCategory.types'
import { DeleteAwardCategory } from './DeleteAwardCategory'

export const AwardCategories = () => {
  const { categories, isLoading, error, refetch } = useAwardCategories()

  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [formState, setFormState] = useState<
    AwardCategoryFormState | undefined
  >(undefined)
  const [categoryToDelete, setCategoryToDelete] = useState<
    AwardCategoryFormState | null
  >(null)

  const handleOpenCreate = () => setIsFormModalOpen(true)

  const handleOpenEdit = (category: AwardCategoryFormState) => {
    setFormState({ id: category.id, name: category.name })
    setIsFormModalOpen(true)
  }

  const handleAddOrEditSuccess = () => {
    setIsFormModalOpen(false)
    setFormState(undefined)
    refetch()
  }

  const handleDeleteSuccess = () => {
    setIsDeleteModalOpen(false)
    setCategoryToDelete(null)
    refetch()
  }

  const handleOpenDelete = (category: AwardCategoryFormState) => {
    setCategoryToDelete(category)
    setIsDeleteModalOpen(true)
  }

  return (
    <div className="relative">
      <div className="min-h-[500px] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-2 py-2">
        <div className="px-3 py-3">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div className="border-l-3 border-primary pl-4">
              <h2 className="text-lg font-semibold text-slate-50">
                Award Categories
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Manage award categories used across the system.
              </p>
            </div>

            <Button onClick={handleOpenCreate}>Add category</Button>
          </div>

          {isLoading && (
            <div className="mb-4 rounded-md border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-300">
              Loading Award Categories…
            </div>
          )}

          {error && (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              Failed to load Award Categories. {error}
            </div>
          )}

          {!isLoading && !error && categories.length === 0 && (
            <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500">
              No Award Categories configured yet.
            </div>
          )}

          {categories.length > 0 && (
            <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm">
              <table className="min-w-full divide-y divide-slate-200 bg-white">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Name
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {categories.map((category) => (
                    <tr key={category.id} className="hover:bg-slate-50/70">
                      <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-slate-900">
                        {category.name}
                      </td>
                      <td className="flex items-center justify-end gap-2 whitespace-nowrap text-right text-sm">
                        <TextButton
                          variant="textTertiary"
                          onClick={() => handleOpenEdit(category)}
                        >
                          <PencilIcon className="size-4" />
                        </TextButton>
                        <TextButton
                          variant="textError"
                          onClick={() => handleOpenDelete(category)}
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

        <AddAwardCategory
          show={isFormModalOpen}
          categoryToEdit={formState}
          onSucess={handleAddOrEditSuccess}
        />
        <DeleteAwardCategory
          show={isDeleteModalOpen}
          categoryToDelete={categoryToDelete}
          onDelete={handleDeleteSuccess}
        />
      </div>
    </div>
  )
}
