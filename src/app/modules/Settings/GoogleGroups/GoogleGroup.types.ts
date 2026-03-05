
export interface DeleteGoogleGroupProps {
  show: boolean;
  groupToDelete: GoogleGroupFormState | null;
  onDelete: () => void;
}

export interface AddGoogleGroupProps {
  show: boolean
  groupToEdit: GoogleGroupFormState | undefined
  onSucess: () => void
}

export interface GoogleGroupFormState {
  id?: string
  name: string
  email: string
}