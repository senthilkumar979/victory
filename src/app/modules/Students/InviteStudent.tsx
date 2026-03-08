'use client'

import { PrimaryButton, SecondaryButton } from '@/atoms/button/Button'
import { FormInput } from '@/molecules/form-input/FormInput'
import { Modal } from '@/ui/organisms/modal/Modal'
import { gooeyToast } from 'goey-toast'
import { useState } from 'react'

interface InviteStudentProps {
  show: boolean
  onClose: () => void
  onSuccess?: () => void
}

export const InviteStudent = ({
  show,
  onClose,
  onSuccess,
}: InviteStudentProps) => {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmitForm = async (event: React.FormEvent) => {
    event.preventDefault()

    const trimmedEmail = email.trim()
    if (!trimmedEmail) return

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/invitations/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailAddress: trimmedEmail }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error ?? 'Failed to send invitation')
      }

      gooeyToast.success('Invitation sent!', {
        description: (
          <div>
            <strong>{trimmedEmail}</strong> will receive an email to sign up.
          </div>
        ),
        bounce: 0.45,
        borderColor: '#E0E0E0',
        borderWidth: 2,
        timing: { displayDuration: 6000 },
      })

      setEmail('')
      onClose()
      onSuccess?.()
    } catch (err) {
      gooeyToast.error(
        err instanceof Error ? err.message : 'Failed to send invitation',
        {
          bounce: 0.45,
          borderColor: '#E0E0E0',
          borderWidth: 2,
        },
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (isSubmitting) return
    setEmail('')
    onClose()
  }

  return (
    <Modal isOpen={show} onClose={handleClose} size="sm" showCloseButton>
      <Modal.Title>Invite Student</Modal.Title>
      <Modal.Body>
        <form
          className="space-y-4"
          onSubmit={handleSubmitForm}
          id="invite-student-form"
        >
          <FormInput
            id="invite-email"
            label="Email address"
            type="email"
            isDarkMode
            placeholder="e.g. student@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </form>
      </Modal.Body>
      <Modal.Footer>
        <SecondaryButton
          type="button"
          onClick={handleClose}
          disabled={isSubmitting}
          className="inline-flex items-center rounded-md border border-slate-700/70 bg-slate-900/80 px-3 py-1.5 text-xs font-medium text-slate-200 transition-colors hover:bg-slate-800 disabled:opacity-50"
        >
          Cancel
        </SecondaryButton>
        <PrimaryButton
          type="submit"
          form="invite-student-form"
          disabled={isSubmitting || !email.trim()}
          className="inline-flex items-center rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {isSubmitting ? 'Sending…' : 'Send invitation'}
        </PrimaryButton>
      </Modal.Footer>
    </Modal>
  )
}
