import type { ProfileData } from '@/types/student.types'

export interface PresenterRecipient {
  name: string
  picture: string
  batch: string | number
}

export interface PresenterFormState {
  id?: string
  presentedBy: string
  presentedDate: string
  topic: string
  student?: PresenterRecipient
}

export interface PresenterFormDrawerProps {
  isOpen: boolean
  presenterToEdit?: PresenterFormState
  onClose: () => void
  onSuccess: () => void
}

export interface DeletePresenterProps {
  show: boolean
  presenterToDelete: PresenterFormState | null
  onClose: () => void
  onDeleted: () => void
}
