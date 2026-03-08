export interface HallOfFameEntryStudent {
  name: string
  picture: string
  batch: string | number
}

export interface HallOfFameEntry {
  id: string
  student_email: string
  date_of_induction: string
  created_at?: string
  student?: HallOfFameEntryStudent
}

export interface HallOfFameFormDrawerProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export interface DeleteHallOfFameEntryProps {
  show: boolean
  entryToDelete: HallOfFameEntry | null
  onClose: () => void
  onDelete: () => void
}
