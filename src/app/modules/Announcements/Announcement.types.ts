export interface AnnouncementFormState {
  id?: string
  title: string
  description: string
  created_at?: string
}

export interface AnnouncementFormDrawerProps {
  isOpen: boolean
  announcementToEdit?: AnnouncementFormState
  onClose: () => void
  onSuccess: () => void
}

export interface DeleteAnnouncementProps {
  show: boolean
  announcementToDelete: AnnouncementFormState | null
  onDelete: () => void
}

