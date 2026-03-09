'use client'

import { usePresenters } from '@/hooks/usePresenters'
import { Modal } from '@/ui/organisms/modal/Modal'
import { gooeyToast } from 'goey-toast'

import type { DeletePresenterProps } from './Presenter.types'

export const DeletePresenter = ({
  show,
  presenterToDelete,
  onClose,
  onDeleted,
}: DeletePresenterProps) => {
  const { deletePresenter } = usePresenters()

  const handleConfirmDelete = async () => {
    if (!presenterToDelete?.id) return
    try {
      await deletePresenter(presenterToDelete.id)
      gooeyToast.success('Presenter deleted successfully.', {
        description: <span>{presenterToDelete.topic}</span>,
        bounce: 0.45,
        borderColor: '#E0E0E0',
        borderWidth: 2,
        timing: { displayDuration: 2000 },
      })
      onDeleted()
    } catch (err) {
      gooeyToast.error('Failed to delete presenter.', {
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
      <Modal.Title>Delete presenter</Modal.Title>
      <Modal.Body>
        <p className="text-sm text-slate-200">
          Are you sure you want to delete the presenter record for{' '}
          <span className="font-semibold">
            {presenterToDelete?.topic ?? 'this topic'}
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
