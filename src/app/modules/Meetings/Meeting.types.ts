export interface MeetingFormState {
  id?: string
  title: string
  date: string
  googleGroupId: string
  description: string
  meetingLink: string
  coverImageUrl: string
}

export interface MeetingFormDrawerProps {
  isOpen: boolean
  meetingToEdit?: MeetingFormState
  onClose: () => void
  onSuccess: () => void
}

export interface DeleteMeetingProps {
  show: boolean
  meetingToDelete: MeetingFormState | null
  onClose: () => void
  onDeleted: () => void
}
