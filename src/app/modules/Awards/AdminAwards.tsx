'use client'

import { useMemo, useState } from 'react'

import { AwardLinkedInPublishDrawer } from '@/components/linkedin'
import { useAwardCategories } from '@/hooks/useAwardCategories'
import { useAwards } from '@/hooks/useAwards'

import type { AwardFormState } from './Award.types'
import { AwardsHeader } from './AwardsHeader'
import { AwardsListStates } from './AwardsListStates'
import { AwardsTable } from './AwardsTable'
import { AwardFormDrawer } from './AwardFormDrawer'
import { DeleteAward } from './DeleteAward'

export const AdminAwards = () => {
  const { awards, isLoading, error, refetch } = useAwards()
  const { categories } = useAwardCategories()
  const [isFormDrawerOpen, setIsFormDrawerOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [formState, setFormState] = useState<AwardFormState | undefined>(
    undefined,
  )
  const [awardToDelete, setAwardToDelete] = useState<AwardFormState | null>(
    null,
  )
  const [linkedInAward, setLinkedInAward] = useState<AwardFormState | null>(
    null,
  )

  const linkedInCompanyName =
    process.env.NEXT_PUBLIC_LINKEDIN_COMPANY_NAME?.trim() || 'MentorBridge'

  const categoryNameById = useMemo(
    () =>
      Object.fromEntries(
        categories
          .filter((c): c is typeof c & { id: string } => Boolean(c.id))
          .map((c) => [c.id, c.name]),
      ),
    [categories],
  )

  const handleOpenCreate = () => {
    setFormState(undefined)
    setIsFormDrawerOpen(true)
  }

  const handleOpenEdit = (award: AwardFormState) => {
    setFormState({
      id: award.id,
      awardedTo: award.awardedTo,
      awardedOn: award.awardedOn,
      description: award.description,
      awardCategoryId: award.awardCategoryId,
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

  const handleOpenDelete = (award: AwardFormState) => {
    setAwardToDelete(award)
    setIsDeleteModalOpen(true)
  }

  const handleDeleteClose = () => {
    setIsDeleteModalOpen(false)
    setAwardToDelete(null)
  }

  const handleDeleted = () => {
    handleDeleteClose()
    refetch()
  }

  const handlePublishToLinkedIn = (award: AwardFormState) => {
    if (!award.id) return
    setLinkedInAward(award)
  }

  const handleCloseLinkedInDrawer = () => {
    setLinkedInAward(null)
  }

  const showStates = isLoading || error || awards.length === 0
  const showTable = !isLoading && !error && awards.length > 0

  return (
    <div className="relative">
      <div className="min-h-[500px] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-2 py-2">
        <div className="px-3 py-3">
          <AwardsHeader onAddAward={handleOpenCreate} />

          {showStates && (
            <AwardsListStates
              isLoading={isLoading}
              error={error}
              isEmpty={awards.length === 0}
            />
          )}

          {showTable && (
            <AwardsTable
              awards={awards}
              categoryNameById={categoryNameById}
              onEdit={handleOpenEdit}
              onDelete={handleOpenDelete}
              onPublishToLinkedIn={handlePublishToLinkedIn}
            />
          )}
        </div>

        <AwardFormDrawer
          isOpen={isFormDrawerOpen}
          awardToEdit={formState}
          onClose={handleCloseDrawer}
          onSuccess={handleFormSuccess}
        />

        <DeleteAward
          show={isDeleteModalOpen}
          awardToDelete={awardToDelete}
          onClose={handleDeleteClose}
          onDeleted={handleDeleted}
        />

        {linkedInAward ? (
          <AwardLinkedInPublishDrawer
            key={linkedInAward.id ?? linkedInAward.awardedTo}
            award={linkedInAward}
            categoryName={
              linkedInAward.awardCategoryId
                ? categoryNameById[linkedInAward.awardCategoryId] ?? ''
                : ''
            }
            isOpen
            onClose={handleCloseLinkedInDrawer}
            onPublished={() => void refetch()}
            companyDisplayName={linkedInCompanyName}
          />
        ) : null}
      </div>
    </div>
  )
}
