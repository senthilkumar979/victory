import { useGoogleGroups } from '@/hooks/useGoogleGroups'
import { Modal } from '@/ui/organisms/modal/Modal'
import { useEffect, useState } from 'react'
import { DeleteGoogleGroupProps } from './GoogleGroup.types'

export const DeleteGoogleGroup = ({
  show,
  groupToDelete,
  onDelete,
}: DeleteGoogleGroupProps) => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(show)
  const { deleteGroup } = useGoogleGroups()

  const handleConfirmDelete = async () => {
    if (!groupToDelete || !groupToDelete.id) return
    await deleteGroup(groupToDelete.id)
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
      <Modal.Title>Delete Google Group</Modal.Title>
      <Modal.Body>
        <p className="text-sm text-slate-200">
          Are you sure you want to delete{' '}
          <span className="font-semibold">
            {groupToDelete?.name ?? 'this group'}
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
