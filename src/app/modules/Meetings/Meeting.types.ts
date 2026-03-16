export interface MeetingFormState {
  id?: string
  title: string
  date: string
  googleGroupId: string
  description: string
  meetingLink: string
  coverImageUrl: string
  feedbackForm?: string
  attendance?: number[]
}

export interface StudentForAttendance {
  id: string
  name: string
  picture: string
  batch: string
  serialNo: number
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
