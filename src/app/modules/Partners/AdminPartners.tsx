'use client'

import { useState } from 'react'

import { usePartners } from '@/hooks/usePartners'

import type { PartnerFormState } from './Partner.types'
import { DeletePartner } from './DeletePartner'
import { PartnerFormDrawer } from './PartnerFormDrawer'
import { PartnersHeader } from './PartnersHeader'
import { PartnersListStates } from './PartnersListStates'
import { PartnersTable } from './PartnersTable'

export const AdminPartners = () => {
  const { partners, isLoading, error, refetch } = usePartners()
  const [isFormDrawerOpen, setIsFormDrawerOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [formState, setFormState] = useState<PartnerFormState | undefined>(
    undefined,
  )
  const [partnerToDelete, setPartnerToDelete] =
    useState<PartnerFormState | null>(null)

  const handleOpenCreate = () => {
    setFormState(undefined)
    setIsFormDrawerOpen(true)
  }

  const handleOpenEdit = (partner: PartnerFormState) => {
    setFormState({
      id: partner.id,
      name: partner.name,
      company: partner.company,
      location: partner.location,
      primaryEmail: partner.primaryEmail,
      primaryContact: partner.primaryContact,
      secondaryEmail: partner.secondaryEmail,
      secondaryContact: partner.secondaryContact,
      designation: partner.designation,
      description: partner.description,
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

  const handleOpenDelete = (partner: PartnerFormState) => {
    setPartnerToDelete(partner)
    setIsDeleteModalOpen(true)
  }

  const handleDeleteClose = () => {
    setIsDeleteModalOpen(false)
    setPartnerToDelete(null)
  }

  const handleDeleted = () => {
    handleDeleteClose()
    refetch()
  }

  const showStates = isLoading || error || partners.length === 0
  const showTable = !isLoading && !error && partners.length > 0

  return (
    <div className="relative">
      <div className="min-h-[500px] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-2 py-2">
        <div className="px-3 py-3">
          <PartnersHeader onAddPartner={handleOpenCreate} />

          {showStates && (
            <PartnersListStates
              isLoading={isLoading}
              error={error}
              isEmpty={partners.length === 0}
            />
          )}

          {showTable && (
            <PartnersTable
              partners={partners}
              onEdit={handleOpenEdit}
              onDelete={handleOpenDelete}
            />
          )}
        </div>

        <PartnerFormDrawer
          isOpen={isFormDrawerOpen}
          partnerToEdit={formState}
          onClose={handleCloseDrawer}
          onSuccess={handleFormSuccess}
        />

        <DeletePartner
          show={isDeleteModalOpen}
          partnerToDelete={partnerToDelete}
          onClose={handleDeleteClose}
          onDeleted={handleDeleted}
        />
      </div>
    </div>
  )
}
