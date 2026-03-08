import { useAwardCategories } from '@/hooks/useAwardCategories'
import { FormInput } from '@/molecules/form-input/FormInput'
import { Modal } from '@/ui/organisms/modal/Modal'
import { gooeyToast } from 'goey-toast'
import { useEffect, useState } from 'react'
import {
  AddAwardCategoryProps,
  AwardCategoryFormState,
} from './AwardCategory.types'

export const AddAwardCategory = ({
  show,
  categoryToEdit,
  onSucess,
}: AddAwardCategoryProps) => {
  const isEditing = !!categoryToEdit
  const { createCategory, updateCategory } = useAwardCategories()

  const [formState, setFormState] = useState<AwardCategoryFormState>({
    name: '',
  })

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    if (categoryToEdit) setFormState(categoryToEdit)

    return () => setFormState({ name: '' })
  }, [categoryToEdit])

  const handleSubmitForm = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!formState.name.trim()) return

    const payload = { name: formState.name.trim() }

    if (isEditing && formState.id) {
      await updateCategory(formState.id, payload)
    } else {
      await createCategory(payload)
    }
    gooeyToast.success('Award category saved successfully!', {
      description: (
        <div>
          <strong>{formState.name}</strong> is now available to use!
        </div>
      ),
      bounce: 0.45,
      borderColor: '#E0E0E0',
      borderWidth: 2,
      timing: { displayDuration: 6000 },
    })
    onSucess()
    setFormState({ name: '' })
  }

  return (
    <Modal isOpen={show} onClose={onSucess} size="sm" showCloseButton={true}>
      <Modal.Title>
        {isEditing ? 'Update Award Category' : 'Create Award Category'}
      </Modal.Title>
      <Modal.Body>
        <form
          className="space-y-4"
          onSubmit={handleSubmitForm}
          id="award-category-form"
        >
          <FormInput
            id="category-name"
            label="Name"
            type="text"
            isDarkMode
            placeholder="e.g. Best Performer"
            autoFocus
            value={formState.name}
            onChange={(e) =>
              setFormState((prev) => ({ ...prev, name: e.target.value }))
            }
          />
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
          form="award-category-form"
          className="inline-flex items-center rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
        >
          {isEditing ? 'Update' : 'Create'}
        </button>
      </Modal.Footer>
    </Modal>
  )
}
