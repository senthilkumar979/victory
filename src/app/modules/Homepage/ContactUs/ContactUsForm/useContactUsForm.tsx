import { zodResolver } from '@hookform/resolvers/zod'
import {
  contactFormSchema,
  type ContactFormValues,
} from '@/lib/contactFormSchema'
import { gooeyToast } from 'goey-toast'
import { useForm } from 'react-hook-form'

export function useContactUsForm() {
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      fullName: '',
      company: '',
      email: '',
      message: '',
    },
  })

  const onSubmit = async (data: ContactFormValues) => {
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as {
        error?: string
      } | null
      gooeyToast.error('Could not send message', {
        description: (
          <span>{payload?.error ?? 'Please try again in a moment.'}</span>
        ),
        bounce: 0.45,
        borderColor: '#E0E0E0',
        borderWidth: 2,
        timing: { displayDuration: 3000 },
      })
      return
    }

    gooeyToast.success('Message sent', {
      description: <span>We&apos;ll get back to you soon.</span>,
      bounce: 0.45,
      borderColor: '#E0E0E0',
      borderWidth: 2,
      timing: { displayDuration: 2500 },
    })
    form.reset()
  }

  return { ...form, onSubmit }
}
