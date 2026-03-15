export interface HallOfFameEntryStudent {
  id?: string
  name: string
  picture: string
  batch: string | number
  role: string
  company: string
}

export interface HallOfFameEntry {
  id: string
  student_email: string
  date_of_induction: string
  created_at?: string
  student?: HallOfFameEntryStudent
  role?: string
  company?: string
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
