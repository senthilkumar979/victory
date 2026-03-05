import { useEffect, useMemo, useState } from 'react'

import { useAnnouncements } from '@/hooks/useAnnouncements'
import { usePushSubscription } from '@/hooks/usePushSubscription'
import { useWebNotification } from '@/hooks/useWebNotification'
import { FormInput } from '@/molecules/form-input/FormInput'
import { RichTextEditor } from '@/organisms/rich-text-editor'
import { Drawer } from '@/ui/organisms/drawer/Drawer'
import { gooeyToast } from 'goey-toast'
import { Check, XIcon } from 'lucide-react'
import { useTriggerEmailOnAnnouncement } from '../../../hooks/useTriggerEmailOnAnnouncement'
import { Button } from '../../../ui/atoms/button/Button'
import type {
  AnnouncementFormDrawerProps,
  AnnouncementFormState,
} from './Announcement.types'

export const AnnouncementFormDrawer = ({
  isOpen,
  announcementToEdit,
  onClose,
  onSuccess,
}: AnnouncementFormDrawerProps) => {
  const { createAnnouncement, updateAnnouncement } = useAnnouncements()
  const {
    triggerEmailOnAnnouncement: sendEmail,
  } = useTriggerEmailOnAnnouncement()
  const { ensureSubscription } = usePushSubscription()
  const { isSupported, requestPermission, notify } = useWebNotification()

  const [formState, setFormState] = useState<AnnouncementFormState>({
    title: '',
    description: '',
  })

  const isEditing = useMemo(() => Boolean(announcementToEdit?.id), [
    announcementToEdit?.id,
  ])

  useEffect(() => {
    if (announcementToEdit) {
      setFormState(announcementToEdit)
    } else {
      setFormState({
        title: '',
        description: '',
      })
    }
  }, [announcementToEdit])

  const handleChange = <K extends keyof Omit<AnnouncementFormState, 'id'>>(
    field: K,
    value: AnnouncementFormState[K],
  ) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    const trimmedTitle = formState.title.trim()
    const trimmedDescription = formState.description.trim()

    if (!trimmedTitle || !trimmedDescription) return

    const payload = {
      title: trimmedTitle,
      description: trimmedDescription,
    }

    if (isEditing && formState.id) {
      await updateAnnouncement(formState.id, payload)
    } else {
      await createAnnouncement(payload)
      await ensureSubscription()

      if (isSupported) {
        const permission = await requestPermission()

        if (permission === 'granted') {
          notify('Important announcement | MentorBridge', {
            body: trimmedTitle,
          })
        }
      }
    }

    gooeyToast.success('Announcement saved successfully!', {
      description: (
        <div>
          <strong>{formState.title}</strong> is now live!
        </div>
      ),
      bounce: 0.45,
      borderColor: '#E0E0E0',
      borderWidth: 2,
      timing: {
        displayDuration: 2000,
      },
    })
    // setTimeout(() => {
    //   gooeyToast.promise(sendEmail(formState), {
    //     loading: 'Sending email to all community members...',
    //     success: 'Email sent Successfully!',
    //     error: 'Something went wrong',
    //     description: {
    //       success:
    //         'Announcement email sent successfully to all community members.',
    //       error:
    //         'Announcement email failed to send to all community members. Please try again later.',
    //     },
    //     action: {
    //       error: {
    //         label: 'Retry',
    //         onClick: () => sendEmail(formState),
    //       },
    //     },
    //   })
    // }, 3500)

    onSuccess()
  }

  return (
    <Drawer isOpen={isOpen} onClose={onClose} size="xxl">
      <Drawer.Title
        description={
          isEditing
            ? 'Update an existing announcement.'
            : 'Create a new announcement for your users.'
        }
      >
        {isEditing ? 'Update announcement' : 'Create announcement'}
      </Drawer.Title>
      <Drawer.Body>
        <form
          id="announcement-form"
          className="space-y-4"
          onSubmit={handleSubmit}
        >
          <FormInput
            id="announcement-title"
            label="Title"
            type="text"
            isDarkMode
            placeholder="e.g. Scheduled maintenance on Saturday"
            autoFocus
            value={formState.title}
            onChange={(event) => handleChange('title', event.target.value)}
          />
          <RichTextEditor
            id="announcement-description"
            label="Description"
            isDarkMode
            placeholder="Provide details about this announcement..."
            value={formState.description}
            handleChange={(value) => handleChange('description', value)}
          />
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
          form="announcement-form"
        >
          <Check className="h-4 w-4" /> {isEditing ? 'Update' : 'Create'}
        </Button>
      </Drawer.Footer>
    </Drawer>
  )
}
