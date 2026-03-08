'use client'

import { PrimaryButton, SecondaryButton } from '@/atoms/button/Button'
import { parseEmails } from '@/utils/emailUtils'
import { Modal } from '@/ui/organisms/modal/Modal'
import { gooeyToast } from 'goey-toast'
import { useState } from 'react'
import { InviteStudentFormFields } from './InviteStudentFormFields'

type InviteMode = 'single' | 'bulk'

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
  const [mode, setMode] = useState<InviteMode>('single')
  const [email, setEmail] = useState('')
  const [bulkText, setBulkText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [bulkProgress, setBulkProgress] = useState<string | null>(null)

  const emails = mode === 'bulk' ? parseEmails(bulkText) : []
  const canSubmit = mode === 'single' ? email.trim().length > 0 : emails.length > 0

  const sendInvitation = async (addr: string) => {
    const res = await fetch('/api/invitations/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emailAddress: addr }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error ?? 'Failed to send invitation')
  }

  const handleSubmitForm = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!canSubmit) return
    setIsSubmitting(true)
    setBulkProgress(null)
    try {
      if (mode === 'single') {
        await sendInvitation(email.trim())
        gooeyToast.success('Invitation sent!', {
          description: <div><strong>{email.trim()}</strong> will receive an email to sign up.</div>,
          bounce: 0.45, borderColor: '#E0E0E0', borderWidth: 2, timing: { displayDuration: 6000 },
        })
        setEmail('')
        onClose()
        onSuccess?.()
      } else {
        const failed: string[] = []
        for (let i = 0; i < emails.length; i++) {
          setBulkProgress(`Inviting ${i + 1} of ${emails.length}…`)
          try { await sendInvitation(emails[i]) } catch { failed.push(emails[i]) }
        }
        setBulkProgress(null)
        const sent = emails.length - failed.length
        gooeyToast.success(`${sent} invitation${sent !== 1 ? 's' : ''} sent.`, {
          description: failed.length
            ? <>Failed: {failed.slice(0, 3).join(', ')}{failed.length > 3 ? '…' : ''}</>
            : undefined,
          bounce: 0.45, borderColor: '#E0E0E0', borderWidth: 2, timing: { displayDuration: 6000 },
        })
        setBulkText('')
        onClose()
        onSuccess?.()
      }
    } catch (err) {
      setBulkProgress(null)
      gooeyToast.error(err instanceof Error ? err.message : 'Failed to send invitation', {
        bounce: 0.45, borderColor: '#E0E0E0', borderWidth: 2,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (isSubmitting) return
    setEmail('')
    setBulkText('')
    setMode('single')
    onClose()
  }

  return (
    <Modal isOpen={show} onClose={handleClose} size="md" showCloseButton>
      <Modal.Title>Invite Student</Modal.Title>
      <Modal.Body>
        <form className="space-y-4" onSubmit={handleSubmitForm} id="invite-student-form">
          <InviteStudentFormFields
            mode={mode}
            setMode={setMode}
            email={email}
            setEmail={setEmail}
            bulkText={bulkText}
            setBulkText={setBulkText}
          />
        </form>
      </Modal.Body>
      <Modal.Footer>
        <SecondaryButton type="button" onClick={handleClose} disabled={isSubmitting}>
          Cancel
        </SecondaryButton>
        <PrimaryButton
          type="submit"
          form="invite-student-form"
          disabled={isSubmitting || !canSubmit}
        >
          {isSubmitting ? (bulkProgress ?? 'Sending…') : `Send invitation${mode === 'bulk' && emails.length > 1 ? `s (${emails.length})` : ''}`}
        </PrimaryButton>
      </Modal.Footer>
    </Modal>
  )
}
