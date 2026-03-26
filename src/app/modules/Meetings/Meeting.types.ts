export interface MeetingFormState {
  id?: string
  title: string
  date: string
  googleGroupId: string
  description: string
  meetingLink: string
  coverImageUrl: string
  feedbackForm?: string
  /** ISO timestamp when feedback email was sent to the Google Group */
  feedbackEmailSentAt?: string | null
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
  /** Called after a successful create or update. `suggestCoverImage` is true only after a new meeting is created. */
  onSuccess: (detail?: {
    meetingId?: string
    suggestCoverImage?: boolean
  }) => void
}

export interface DeleteMeetingProps {
  show: boolean
  meetingToDelete: MeetingFormState | null
  onClose: () => void
  onDeleted: () => void
}
