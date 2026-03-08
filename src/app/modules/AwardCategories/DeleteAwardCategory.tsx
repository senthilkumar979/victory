import { useAwardCategories } from '@/hooks/useAwardCategories'
import { Modal } from '@/ui/organisms/modal/Modal'
import { gooeyToast } from 'goey-toast'
import { useEffect, useState } from 'react'
import { DeleteAwardCategoryProps } from './AwardCategory.types'

export const DeleteAwardCategory = ({
  show,
  categoryToDelete,
  onDelete,
}: DeleteAwardCategoryProps) => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(show)
  const { deleteCategory } = useAwardCategories()

  const handleConfirmDelete = async () => {
    if (!categoryToDelete?.id) return
    await deleteCategory(categoryToDelete.id)
    gooeyToast.success('Award category deleted successfully!', {
      description: (
        <div>
          <strong>{categoryToDelete.name}</strong> has been deleted.
        </div>
      ),
      bounce: 0.45,
      borderColor: '#E0E0E0',
      borderWidth: 2,
      timing: { displayDuration: 6000 },
    })
    onDelete()
    setIsDeleteModalOpen(false)
  }

  useEffect(() => {
    setIsDeleteModalOpen(show)
  }, [show])

  return (
    <Modal
      isOpen={isDeleteModalOpen}
      onClose={() => setIsDeleteModalOpen(false)}
      size="sm"
    >
      <Modal.Title>Delete Award Category</Modal.Title>
      <Modal.Body>
        <p className="text-sm text-slate-200">
          Are you sure you want to delete{' '}
          <span className="font-semibold">
            {categoryToDelete?.name ?? 'this category'}
          </span>
          ? This action cannot be undone.
        </p>
      </Modal.Body>
      <Modal.Footer>
        <button
          type="button"
          onClick={() => setIsDeleteModalOpen(false)}
          className="inline-flex items-center rounded-md border border-slate-700/70 bg-slate-900/80 px-3 py-1.5 text-xs font-medium text-slate-200 transition-colors hover:bg-slate-800"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleConfirmDelete}
          className="inline-flex items-center rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-red-500"
        >
          Delete
        </button>
      </Modal.Footer>
    </Modal>
  )
}
