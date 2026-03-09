'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { usePresenters } from '@/hooks/usePresenters'
import { Drawer } from '@/ui/organisms/drawer/Drawer'
import { gooeyToast } from 'goey-toast'
import { Check, XIcon } from 'lucide-react'

import { Button } from '@/atoms/button/Button'
import type {
  PresenterFormDrawerProps,
  PresenterFormState,
} from './Presenter.types'
import { PresenterFormFields } from './PresenterFormFields'
import {
  presenterFormSchema,
  type PresenterFormValues,
} from './presenterFormSchema'

const toFormValues = (p: PresenterFormState | null): PresenterFormValues => ({
  presentedBy: p?.presentedBy ?? '',
  presentedDate: p?.presentedDate ?? '',
  topic: p?.topic ?? '',
})

export const PresenterFormDrawer = ({
  isOpen,
  presenterToEdit,
  onClose,
  onSuccess,
}: PresenterFormDrawerProps) => {
  const { createPresenter, updatePresenter } = usePresenters()
  const form = useForm<PresenterFormValues>({
    resolver: zodResolver(presenterFormSchema),
    defaultValues: toFormValues(null),
  })

  useEffect(() => {
    if (!isOpen) return
    form.reset(toFormValues(presenterToEdit ?? null))
  }, [isOpen, presenterToEdit, form])

  const isEditing = Boolean(presenterToEdit?.id)

  const handleSubmit = form.handleSubmit(async (data) => {
    const payload: Omit<PresenterFormState, 'id'> = {
      presentedBy: data.presentedBy.trim(),
      presentedDate: data.presentedDate.trim(),
      topic: data.topic.trim(),
    }

    try {
      if (isEditing && presenterToEdit?.id) {
        await updatePresenter(presenterToEdit.id, payload)
      } else {
        await createPresenter(payload)
      }
      gooeyToast.success('Presenter saved successfully.', {
        description: <span>{payload.topic}</span>,
        bounce: 0.45,
        borderColor: '#E0E0E0',
        borderWidth: 2,
        timing: { displayDuration: 2000 },
      })
      onSuccess()
    } catch (err) {
      gooeyToast.error('Failed to save presenter.', {
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
            ? 'Update an existing presenter record.'
            : 'Create a new presenter with student, date, and topic.'
        }
      >
        {isEditing ? 'Update presenter' : 'Create presenter'}
      </Drawer.Title>
      <Drawer.Body>
        <form
          id="presenter-form"
          className="space-y-4"
          onSubmit={handleSubmit}
        >
          <PresenterFormFields formId="presenter-form" form={form} />
        </form>
      </Drawer.Body>
      <Drawer.Footer>
        <Button variant="secondary" size="sm" onClick={onClose}>
          <XIcon className="h-4 w-4" /> Cancel
        </Button>
        <Button variant="primary" size="sm" type="submit" form="presenter-form">
          <Check className="h-4 w-4" /> {isEditing ? 'Update' : 'Create'}
        </Button>
      </Drawer.Footer>
    </Drawer>
  )
}
