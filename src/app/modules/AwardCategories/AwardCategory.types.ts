export interface DeleteAwardCategoryProps {
  show: boolean
  categoryToDelete: AwardCategoryFormState | null
  onDelete: () => void
}

export interface AddAwardCategoryProps {
  show: boolean
  categoryToEdit: AwardCategoryFormState | undefined
  onSucess: () => void
}

export interface AwardCategoryFormState {
  id?: string
  name: string
}
