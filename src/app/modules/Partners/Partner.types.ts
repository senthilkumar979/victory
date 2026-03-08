export interface PartnerFormState {
  id?: string
  name: string
  company: string
  location: string
  primaryEmail: string
  primaryContact: string
  secondaryEmail: string
  secondaryContact: string
  designation: string
  category: string
  description: string
}

export interface PartnerFormDrawerProps {
  isOpen: boolean
  partnerToEdit?: PartnerFormState
  onClose: () => void
  onSuccess: () => void
}

export interface DeletePartnerProps {
  show: boolean
  partnerToDelete: PartnerFormState | null
  onClose: () => void
  onDeleted: () => void
}
