'use client'

import { useState } from 'react'

import { usePresenters } from '@/hooks/usePresenters'

import type { PresenterFormState } from './Presenter.types'
import { PresentersHeader } from './PresentersHeader'
import { PresentersListStates } from './PresentersListStates'
import { PresentersTable } from './PresentersTable'
import { PresenterFormDrawer } from './PresenterFormDrawer'
import { DeletePresenter } from './DeletePresenter'

export const AdminPresenters = () => {
  const { presenters, isLoading, error, refetch } = usePresenters()
  const [isFormDrawerOpen, setIsFormDrawerOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [formState, setFormState] = useState<PresenterFormState | undefined>(
    undefined,
  )
  const [presenterToDelete, setPresenterToDelete] =
    useState<PresenterFormState | null>(null)

  const handleOpenCreate = () => {
    setFormState(undefined)
    setIsFormDrawerOpen(true)
  }

  const handleOpenEdit = (presenter: PresenterFormState) => {
    setFormState({
      id: presenter.id,
      presentedBy: presenter.presentedBy,
      presentedDate: presenter.presentedDate,
      topic: presenter.topic,
    })
    setIsFormDrawerOpen(true)
  }

  const handleFormSuccess = () => {
    setIsFormDrawerOpen(false)
    setFormState(undefined)
    refetch()
  }

  const handleCloseDrawer = () => {
    setIsFormDrawerOpen(false)
    setFormState(undefined)
  }

  const handleOpenDelete = (presenter: PresenterFormState) => {
    setPresenterToDelete(presenter)
    setIsDeleteModalOpen(true)
  }

  const handleDeleteClose = () => {
    setIsDeleteModalOpen(false)
    setPresenterToDelete(null)
  }

  const handleDeleted = () => {
    handleDeleteClose()
    refetch()
  }

  const showStates = isLoading || error || presenters.length === 0
  const showTable = !isLoading && !error && presenters.length > 0

  return (
    <div className="relative">
      <div className="min-h-[500px] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-2 py-2">
        <div className="px-3 py-3">
          <PresentersHeader onAddPresenter={handleOpenCreate} />

          {showStates && (
            <PresentersListStates
              isLoading={isLoading}
              error={error}
              isEmpty={presenters.length === 0}
            />
          )}

          {showTable && (
            <PresentersTable
              presenters={presenters}
              onEdit={handleOpenEdit}
              onDelete={handleOpenDelete}
            />
          )}
        </div>

        <PresenterFormDrawer
          isOpen={isFormDrawerOpen}
          presenterToEdit={formState}
          onClose={handleCloseDrawer}
          onSuccess={handleFormSuccess}
        />

        <DeletePresenter
          show={isDeleteModalOpen}
          presenterToDelete={presenterToDelete}
          onClose={handleDeleteClose}
          onDeleted={handleDeleted}
        />
      </div>
    </div>
  )
}
