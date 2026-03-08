'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { useAwards } from '@/hooks/useAwards'
import { Drawer } from '@/ui/organisms/drawer/Drawer'
import { gooeyToast } from 'goey-toast'
import { Check, XIcon } from 'lucide-react'

import { Button } from '@/atoms/button/Button'
import type { AwardFormDrawerProps, AwardFormState } from './Award.types'
import { AwardFormFields } from './AwardFormFields'
import {
  awardFormSchema,
  type AwardFormValues,
} from './awardFormSchema'

const toFormValues = (a: AwardFormState | null): AwardFormValues => ({
  awardedTo: a?.awardedTo ?? '',
  awardedOn: a?.awardedOn ?? '',
  description: a?.description ?? '',
  awardCategoryId: a?.awardCategoryId ?? '',
})

export const AwardFormDrawer = ({
  isOpen,
  awardToEdit,
  onClose,
  onSuccess,
}: AwardFormDrawerProps) => {
  const { createAward, updateAward } = useAwards()
  const form = useForm<AwardFormValues>({
    resolver: zodResolver(awardFormSchema),
    defaultValues: toFormValues(null),
  })

  useEffect(() => {
    if (!isOpen) return
    form.reset(toFormValues(awardToEdit ?? null))
  }, [isOpen, awardToEdit, form])

  const isEditing = Boolean(awardToEdit?.id)

  const handleSubmit = form.handleSubmit(async (data) => {
    const payload: Omit<AwardFormState, 'id'> = {
      awardedTo: data.awardedTo.trim(),
      awardedOn: data.awardedOn.trim(),
      description: data.description.trim(),
      awardCategoryId: (data.awardCategoryId ?? '').trim() || '',
    }

    try {
      if (isEditing && awardToEdit?.id) {
        await updateAward(awardToEdit.id, payload)
      } else {
        await createAward(payload)
      }
      gooeyToast.success('Award saved successfully.', {
        description: <span>To {payload.awardedTo}</span>,
        bounce: 0.45,
        borderColor: '#E0E0E0',
        borderWidth: 2,
        timing: { displayDuration: 2000 },
      })
      onSuccess()
    } catch (err) {
      gooeyToast.error('Failed to save award.', {
        description: err instanceof Error ? err.message : 'Please try again.',
        bounce: 0.45,
        borderColor: '#E0E0E0',
        borderWidth: 2,
        timing: { displayDuration: 3000 },
      })
    }
  })

  return (
    <Drawer isOpen={isOpen} onClose={onClose} size="xxl">
      <Drawer.Title
        description={
          isEditing
            ? 'Update an existing award.'
            : 'Create a new award with recipient and details.'
        }
      >
        {isEditing ? 'Update award' : 'Create award'}
      </Drawer.Title>
      <Drawer.Body>
        <form
          id="award-form"
          className="space-y-4"
          onSubmit={handleSubmit}
        >
          <AwardFormFields formId="award-form" form={form} />
        </form>
      </Drawer.Body>
      <Drawer.Footer>
        <Button variant="secondary" size="sm" onClick={onClose}>
          <XIcon className="h-4 w-4" /> Cancel
        </Button>
        <Button variant="primary" size="sm" type="submit" form="award-form">
          <Check className="h-4 w-4" /> {isEditing ? 'Update' : 'Create'}
        </Button>
      </Drawer.Footer>
    </Drawer>
  )
}
