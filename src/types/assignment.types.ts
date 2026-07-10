export type AssignmentDueStatus = 'upcoming' | 'due_soon' | 'past_due'

export type StudentSubmissionStatus = 'not_submitted' | 'submitted'

export interface Cohort {
  id: string
  name: string
}

export interface Assignment {
  id: string
  title: string
  description: string
  cohortId: string
  cohortName?: string
  googleGroupId: string
  attachments: string | null
  dueDate: string
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface AssignmentSubmission {
  id: string
  assignmentId: string
  studentId: string
  studentName?: string
  studentEmail?: string
  googleDocUrl: string
  githubRepoUrl: string
  submittedAt: string
  updatedAt: string
  rating: number | null
  feedbackComment: string | null
  reviewedBy: string | null
  reviewedAt: string | null
}

export interface SubmissionFeedbackFormState {
  rating: number
  reviewedBy: string
  feedbackComment: string
}

export interface AssignmentStats {
  totalStudents: number
  submittedCount: number
  pendingCount: number
  submissionPercentage: number
}

export interface AssignmentListItem extends Assignment {
  stats: AssignmentStats
  mySubmissionStatus?: StudentSubmissionStatus
  dueStatus: AssignmentDueStatus
}

export interface AssignmentFormState {
  id?: string
  title: string
  description: string
  cohortId: string
  googleGroupId: string
  attachments: string
  dueDate: string
}

export interface SubmissionFormState {
  googleDocUrl: string
  githubRepoUrl: string
}
