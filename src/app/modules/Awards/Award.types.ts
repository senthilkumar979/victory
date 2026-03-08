export interface AwardRecipient {
  name: string
  picture: string
  batch: string | number
}

export interface AwardFormState {
  id?: string
  awardedTo: string
  awardedOn: string
  description: string
  awardCategoryId: string
  student?: AwardRecipient
}

export interface AwardFormDrawerProps {
  isOpen: boolean
  awardToEdit?: AwardFormState
  onClose: () => void
  onSuccess: () => void
}

export interface DeleteAwardProps {
  show: boolean
  awardToDelete: AwardFormState | null
  onClose: () => void
  onDeleted: () => void
}
