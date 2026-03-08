'use client'

import { useAwards } from '@/hooks/useAwards'
import { Modal } from '@/ui/organisms/modal/Modal'
import { gooeyToast } from 'goey-toast'

import type { DeleteAwardProps } from './Award.types'

export const DeleteAward = ({
  show,
  awardToDelete,
  onClose,
  onDeleted,
}: DeleteAwardProps) => {
  const { deleteAward } = useAwards()

  const handleConfirmDelete = async () => {
    if (!awardToDelete?.id) return
    try {
      await deleteAward(awardToDelete.id)
      gooeyToast.success('Award deleted successfully.', {
        description: <span>{awardToDelete.awardedTo}</span>,
        bounce: 0.45,
        borderColor: '#E0E0E0',
        borderWidth: 2,
        timing: { displayDuration: 2000 },
      })
      onDeleted()
    } catch (err) {
      gooeyToast.error('Failed to delete award.', {
        description: err instanceof Error ? err.message : 'Please try again.',
        bounce: 0.45,
        borderColor: '#E0E0E0',
        borderWidth: 2,
        timing: { displayDuration: 3000 },
      })
    }
  }

  return (
    <Modal isOpen={show} onClose={onClose} size="sm">
      <Modal.Title>Delete award</Modal.Title>
      <Modal.Body>
        <p className="text-sm text-slate-200">
          Are you sure you want to delete the award to{' '}
          <span className="font-semibold">
            {awardToDelete?.awardedTo ?? 'this recipient'}
          </span>
          ? This action cannot be undone.
        </p>
      </Modal.Body>
      <Modal.Footer>
        <button
          type="button"
          onClick={onClose}
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
