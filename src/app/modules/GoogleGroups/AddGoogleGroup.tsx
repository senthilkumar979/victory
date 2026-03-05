import { useGoogleGroups } from '@/hooks/useGoogleGroups'
import { FormInput } from '@/molecules/form-input/FormInput'
import { Modal } from '@/ui/organisms/modal/Modal'
import { gooeyToast } from 'goey-toast'
import { useEffect, useState } from 'react'
import { AddGoogleGroupProps, GoogleGroupFormState } from './GoogleGroup.types'

export const AddGoogleGroup = ({
  show,
  groupToEdit,
  onSucess,
}: AddGoogleGroupProps) => {
  const isEditing = !!groupToEdit
  const { createGroup, updateGroup, refetch } = useGoogleGroups()

  const [formState, setFormState] = useState<GoogleGroupFormState>({
    name: '',
    email: '',
  })

  useEffect(() => {
    if (groupToEdit) {
      setFormState(groupToEdit)
    }

    return () => {
      setFormState({
        name: '',
        email: '',
      })
    }
  }, [groupToEdit])

  const handleSubmitForm = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!formState.name.trim() || !formState.email.trim()) return

    const payload = {
      name: formState.name.trim(),
      email: formState.email.trim(),
    }

    if (isEditing && formState.id) {
      await updateGroup(formState.id, payload)
    } else {
      await createGroup(payload)
    }
    gooeyToast.success('Google Group saved successfully!', {
      description: (
        <div>
          <strong>{formState.name}</strong> is now available to use!
        </div>
      ),
      bounce: 0.45,
      borderColor: '#E0E0E0',
      borderWidth: 2,
      timing: {
        displayDuration: 6000,
      },
    })
    onSucess()
  }

  const handleFormChange = (
    field: keyof Omit<GoogleGroupFormState, 'id'>,
    value: string,
  ) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  return (
    <Modal isOpen={show} onClose={onSucess} size="sm" showCloseButton={true}>
      <Modal.Title>
        {isEditing ? 'Update Google Group' : 'Create Google Group'}
      </Modal.Title>
      <Modal.Body>
        <form
          className="space-y-4"
          onSubmit={handleSubmitForm}
          id="google-group-form"
        >
          <div>
            <FormInput
              id="group-name"
              label="Name"
              type="text"
              isDarkMode
              placeholder="e.g. Frontend Team"
              autoFocus
              value={formState.name}
              onChange={(event) => handleFormChange('name', event.target.value)}
            />
          </div>
          <div>
            <FormInput
              id="group-email"
              label="Email"
              isDarkMode
              type="email"
              value={formState.email}
              onChange={(event) =>
                handleFormChange('email', event.target.value)
              }
            />
          </div>
        </form>
      </Modal.Body>
      <Modal.Footer>
        <button
          type="button"
          onClick={onSucess}
          className="inline-flex items-center rounded-md border border-slate-700/70 bg-slate-900/80 px-3 py-1.5 text-xs font-medium text-slate-200 transition-colors hover:bg-slate-800"
        >
          Cancel
        </button>
        <button
          type="submit"
          form="google-group-form"
          className="inline-flex items-center rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
        >
          {isEditing ? 'Update' : 'Create'}
        </button>
      </Modal.Footer>
    </Modal>
  )
}
