export const ASSIGNMENT_CATEGORIES = [
  'Frontend',
  'Backend',
  'Data',
  'Misc',
] as const

export type AssignmentCategory = (typeof ASSIGNMENT_CATEGORIES)[number]

export const ASSIGNMENT_CATEGORY_OPTIONS: {
  value: AssignmentCategory
  label: string
}[] = ASSIGNMENT_CATEGORIES.map((value) => ({ value, label: value }))
