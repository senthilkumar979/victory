'use client'

import { useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { Button } from '@/atoms/button/Button'
import { useHallOfFame } from '@/hooks/useHallOfFame'
import { Drawer } from '@/ui/organisms/drawer/Drawer'
import { gooeyToast } from 'goey-toast'
import { Check, XIcon } from 'lucide-react'

import type { HallOfFameFormDrawerProps } from './HallOfFame.types'
import { HallOfFameFormFields } from './HallOfFameFormFields'
import {
  hallOfFameFormSchema,
  type HallOfFameFormValues,
} from './hallOfFameFormSchema'

const defaultValues: HallOfFameFormValues = {
  studentEmail: '',
  dateOfInduction: '',
}

export const HallOfFameFormDrawer = ({
  isOpen,
  onClose,
  onSuccess,
}: HallOfFameFormDrawerProps) => {
  const { createEntry } = useHallOfFame()
  const mountKeyRef = useRef(0)

  const form = useForm<HallOfFameFormValues>({
    resolver: zodResolver(hallOfFameFormSchema),
    defaultValues,
  })

  useEffect(() => {
    if (isOpen) {
      mountKeyRef.current += 1
      form.reset(defaultValues)
    }
  }, [isOpen, form])

  const handleSubmit = form.handleSubmit(async (data) => {
    try {
      await createEntry({
        student_email: data.studentEmail.trim(),
        date_of_induction: data.dateOfInduction.trim(),
      })
      gooeyToast.success('Hall of Fame entry added successfully!', {
        description: <span>{data.studentEmail} inducted</span>,
        bounce: 0.45,
        borderColor: '#E0E0E0',
        borderWidth: 2,
        timing: { displayDuration: 2000 },
      })
      onSuccess()
    } catch (err) {
      gooeyToast.error('Failed to add entry.', {
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
        description="Add a student to the Hall of Fame with their induction date."
      >
        Add to Hall of Fame
      </Drawer.Title>
      <Drawer.Body>
        <form
          id="hall-of-fame-form"
          key={mountKeyRef.current}
          className="space-y-4"
          onSubmit={handleSubmit}
        >
          <HallOfFameFormFields formId="hall-of-fame-form" form={form} />
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
          form="hall-of-fame-form"
        >
          <Check className="h-4 w-4" /> Add
        </Button>
      </Drawer.Footer>
    </Drawer>
  )
}
