'use client'

import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { usePartners } from '@/hooks/usePartners'
import { Drawer } from '@/ui/organisms/drawer/Drawer'
import { gooeyToast } from 'goey-toast'
import { Check, XIcon } from 'lucide-react'

import { Button } from '@/atoms/button/Button'
import type {
  PartnerFormDrawerProps,
  PartnerFormState,
} from './Partner.types'
import { PartnerFormFields } from './PartnerFormFields'
import {
  partnerFormSchema,
  type PartnerFormValues,
} from './partnerFormSchema'

const toFormValues = (p: PartnerFormState | null): PartnerFormValues => ({
  name: p?.name ?? '',
  company: p?.company ?? '',
  location: p?.location ?? '',
  category: p?.category ?? '',
  primaryEmail: p?.primaryEmail ?? '',
  primaryContact: p?.primaryContact ?? '',
  secondaryEmail: p?.secondaryEmail ?? '',
  secondaryContact: p?.secondaryContact ?? '',
  designation: p?.designation ?? '',
  description: p?.description ?? '',
})

export const PartnerFormDrawer = ({
  isOpen,
  partnerToEdit,
  onClose,
  onSuccess,
}: PartnerFormDrawerProps) => {
  const { createPartner, updatePartner } = usePartners()
  const form = useForm<PartnerFormValues>({
    resolver: zodResolver(partnerFormSchema),
    defaultValues: toFormValues(null),
  })

  useEffect(() => {
    if (!isOpen) return
    form.reset(toFormValues(partnerToEdit ?? null))
  }, [isOpen, partnerToEdit, form])

  const isEditing = useMemo(
    () => Boolean(partnerToEdit?.id),
    [partnerToEdit?.id],
  )

  const handleSubmit = form.handleSubmit(async (data) => {
    const payload: Omit<PartnerFormState, 'id'> = {
      name: data.name.trim(),
      company: data.company.trim(),
      location: data.location.trim(),
      category: (data.category ?? '').trim(),
      primaryEmail: (data.primaryEmail ?? '').trim(),
      primaryContact: (data.primaryContact ?? '').trim(),
      secondaryEmail: (data.secondaryEmail ?? '').trim(),
      secondaryContact: (data.secondaryContact ?? '').trim(),
      designation: (data.designation ?? '').trim(),
      description: (data.description ?? '').trim(),
    }

    try {
      if (isEditing && partnerToEdit?.id) {
        await updatePartner(partnerToEdit.id, payload)
      } else {
        await createPartner(payload)
      }
      gooeyToast.success('Partner saved successfully.', {
        description: <span>{payload.name}</span>,
        bounce: 0.45,
        borderColor: '#E0E0E0',
        borderWidth: 2,
        timing: { displayDuration: 2000 },
      })
      onSuccess()
    } catch (err) {
      gooeyToast.error('Failed to save partner.', {
        description:
          err instanceof Error ? err.message : 'Please try again.',
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
            ? 'Update partner details.'
            : 'Add a new partner with contact information.'
        }
      >
        {isEditing ? 'Update partner' : 'Add partner'}
      </Drawer.Title>
      <Drawer.Body>
        <form
          id="partner-form"
          className="space-y-4"
          onSubmit={handleSubmit}
        >
          <PartnerFormFields formId="partner-form" form={form} />
        </form>
      </Drawer.Body>
      <Drawer.Footer>
        <Button variant="secondary" size="sm" onClick={onClose}>
          <XIcon className="h-4 w-4" /> Cancel
        </Button>
        <Button
          variant="primary"
          size="sm"
          type="submit"
          form="partner-form"
        >
          <Check className="h-4 w-4" /> {isEditing ? 'Update' : 'Create'}
        </Button>
      </Drawer.Footer>
    </Drawer>
  )
}
