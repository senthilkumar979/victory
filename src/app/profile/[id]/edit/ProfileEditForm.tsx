'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { FieldErrors, Resolver } from 'react-hook-form'
import { useForm } from 'react-hook-form'

import { useUpdateStudent } from '@/hooks/useUpdateStudent'
import { Button, PrimaryButton } from '@/ui/atoms/button/Button'
import { motion } from 'framer-motion'
import { gooeyToast } from 'goey-toast'
import { ArrowLeft, Loader2, Save } from 'lucide-react'
import * as Sentry from '@sentry/nextjs'
import { usePostHog } from 'posthog-js/react'

import { LogSnagPageView } from '@/components/analytics/LogSnagPageView'
import { PosthogCaptureOnce } from '@/components/analytics/PosthogCaptureOnce'
import { useCreateStudentProfile } from '@/hooks/useCreateStudentProfile'
import type { ProfileData } from '@/types/student.types'
import { ProfileEditFormFields } from './ProfileEditFormFields'
import {
  profileEditFormSchema,
  type ProfileEditFormValues,
} from './profileEditFormSchema'

function toFormValues(student: ProfileData | null): ProfileEditFormValues {
  if (!student) {
    return {
      name: '',
      picture: '',
      role: '',
      company: '',
      summary: '',
      email: '',
      mediumUsername: '',
      batch: '',
      gender: '',
      resumeLink: '',
      skillSets: '',
      inspirations: '',
      experience: [],
      socialLinks: { linkedIn: '', gitHub: '', website: '' },
    }
  }
  return {
    name: student.name ?? '',
    picture: student.picture ?? '',
    role: String(student.role ?? ''),
    company: student.company ?? '',
    summary: student.summary ?? '',
    email: student.email ?? '',
    mediumUsername: student.mediumUsername ?? '',
    batch: String(student.batch ?? ''),
    gender: (() => {
      const g = student.gender?.trim()?.toUpperCase()
      return g === 'M' || g === 'F' ? g : ''
    })(),
    resumeLink: student.resumeLink ?? '',
    skillSets: student.skillSets?.join(', ') ?? '',
    inspirations: student.inspirations?.join(', ') ?? '',
    experience: (student.experience ?? []).map((e) => ({
      company: e.company ?? '',
      role: e.role ?? '',
      summary: e.summary ?? '',
      website: e.website ?? '',
    })),
    mentorBridgeExp: (() => {
      const m = student.mentorBridgeExp
      if (!m) return undefined
      return {
        company: m.company ?? '',
        role: m.role ?? '',
        summary: m.summary ?? '',
        website: m.website ?? '',
      }
    })(),
    socialLinks: {
      linkedIn: student.socialLinks?.linkedIn ?? '',
      gitHub: student.socialLinks?.gitHub ?? '',
      website: student.socialLinks?.website ?? '',
    },
  }
}

function parseCommaList(s: string | undefined): string[] {
  if (!s?.trim()) return []
  return s
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean)
}

const toastSurface = {
  bounce: 0.45,
  borderColor: '#E0E0E0',
  borderWidth: 2,
} as const

function humanizeValidatorMessage(raw: string): string {
  const msg = raw.trim()
  if (/expected string,\s*received undefined/i.test(msg)) {
    return 'A field is empty or missing. Check all sections (including experience blocks) and try again.'
  }
  if (/expected string,\s*received null/i.test(msg)) {
    return 'A field has an invalid empty value. Please review the form and try again.'
  }
  return msg
}

function collectFormErrorMessages(errors: FieldErrors<ProfileEditFormValues>): string[] {
  const out: string[] = []
  const walk = (node: unknown): void => {
    if (!node || typeof node !== 'object') return
    const n = node as Record<string, unknown>
    const msg = n.message
    if (typeof msg === 'string' && msg.trim()) out.push(humanizeValidatorMessage(msg))
    for (const [key, val] of Object.entries(n)) {
      if (
        key === 'message' ||
        key === 'ref' ||
        key === 'type' ||
        key === 'types' ||
        key === 'root'
      )
        continue
      if (val && typeof val === 'object') {
        if (Array.isArray(val)) {
          for (const item of val) walk(item)
        } else {
          walk(val)
        }
      }
    }
  }
  walk(errors)
  return [...new Set(out)]
}

function getThrownMessage(err: unknown): string {
  if (err instanceof Error) return err.message
  if (typeof err === 'string') return err
  if (err && typeof err === 'object' && 'message' in err) {
    const m = (err as { message: unknown }).message
    if (typeof m === 'string' && m.trim()) return m
  }
  return 'Please try again.'
}

interface ProfileEditFormProps {
  student: ProfileData | null
  studentId: string
  email?: string | null
  onBack?: () => void
  /** Called after a successful save (e.g. refetch student so uploads have an id). */
  onSaveSuccess?: () => void | Promise<void>
}

export const ProfileEditForm = ({
  student,
  studentId,
  email,
  onBack,
  onSaveSuccess,
}: ProfileEditFormProps) => {
  const posthog = usePostHog()
  const router = useRouter()
  const { updateStudent } = useUpdateStudent()
  const { createStudentProfile } = useCreateStudentProfile()
  const [uploadStudentId, setUploadStudentId] = useState<string | null>(null)
  /** Vercel Blob URLs from file pick; not written to Supabase until Save succeeds. */
  const [stagedPictureUrl, setStagedPictureUrl] = useState<string | null>(null)
  const [stagedResumeUrl, setStagedResumeUrl] = useState<string | null>(null)
  const resolvedStudentId = studentId?.trim() || uploadStudentId || ''

  useEffect(() => {
    if (studentId?.trim()) setUploadStudentId(null)
  }, [studentId])

  const prevLoadedStudentIdRef = useRef<string | undefined>(undefined)
  useEffect(() => {
    const id = student?.id
    const prev = prevLoadedStudentIdRef.current
    if (prev !== undefined && id !== undefined && prev !== id) {
      setStagedPictureUrl(null)
      setStagedResumeUrl(null)
    }
    prevLoadedStudentIdRef.current = id
  }, [student?.id])
  const form = useForm<ProfileEditFormValues>({
    resolver: zodResolver(
      profileEditFormSchema,
    ) as Resolver<ProfileEditFormValues>,
    defaultValues: toFormValues(student),
    mode: 'onTouched',
  })

  useEffect(() => {
      form.reset({
        ...toFormValues(student ?? null),
        email: email ?? student?.email ?? '',
      })
  }, [student, form, email])

  const captureButtonClick = useCallback(
    (button: string, placement?: string) => {
      posthog.capture('ui_button_clicked', {
        surface: 'profile_edit',
        button,
        ...(placement ? { placement } : {}),
      })
    },
    [posthog],
  )

  const onValidationError = useCallback(
    (errors: FieldErrors<ProfileEditFormValues>) => {
      posthog.capture('profile_form_validation_failed', {
        fields: Object.keys(errors),
        field_count: Object.keys(errors).length,
        student_id: studentId || undefined,
      })
      const messages = collectFormErrorMessages(errors)
      const maxShown = 6
      const shown = messages.slice(0, maxShown)
      const suffix =
        messages.length > maxShown ? ` (+${messages.length - maxShown} more)` : ''
      const description =
        shown.length > 0
          ? `${shown.join(' · ')}${suffix}`
          : 'Please check the highlighted fields and try again.'
      gooeyToast.error('Could not save profile', {
        description,
        ...toastSurface,
        timing: { displayDuration: 7000 },
      })
    },
    [posthog, studentId],
  )

  const handleSubmit = form.handleSubmit(async (data) => {
    posthog.capture('profile_form_submit_started', {
      is_update: Boolean(studentId),
      student_id: studentId || undefined,
    })
    try {
      const skillSets = parseCommaList(data.skillSets)
      const inspirations = parseCommaList(data.inspirations)
      const socialLinks = {
        linkedIn: data.socialLinks?.linkedIn?.trim() ?? '',
        gitHub: data.socialLinks?.gitHub?.trim() ?? '',
        website: data.socialLinks?.website?.trim() ?? '',
      }

      const validExperience = data.experience.filter(
        (e) => e.company.trim() || e.role.trim(),
      )

      const pictureToSave = (stagedPictureUrl ?? data.picture)?.trim() || ''
      const resumeToSave = (stagedResumeUrl ?? data.resumeLink)?.trim() || ''

      const payload = {
        name: data.name,
        picture: pictureToSave || undefined,
        role: data.role,
        company: data.company || undefined,
        summary: data.summary || undefined,
        email: data.email,
        mediumUsername: data.mediumUsername || undefined,
        batch: data.batch,
        gender: data.gender || undefined,
        resumeLink: resumeToSave || undefined,
        skillSets: skillSets.length > 0 ? skillSets : undefined,
        inspirations: inspirations.length > 0 ? inspirations : undefined,
        experience: validExperience?.length ? validExperience : undefined,
        mentorBridgeExp: data.mentorBridgeExp,
        socialLinks,
      }

      if (studentId?.trim()) {
        await updateStudent(studentId, payload)
      } else {
        const created = await createStudentProfile(payload)
        if (created?.id) setUploadStudentId(created.id)
      }

      setStagedPictureUrl(null)
      setStagedResumeUrl(null)

      gooeyToast.success('Profile updated successfully.', {
        description: `${data.name}'s profile has been saved.`,
        ...toastSurface,
        timing: { displayDuration: 5000 },
      })
      posthog.capture('profile_form_submit_succeeded', {
        student_id: studentId || undefined,
        is_update: Boolean(studentId),
      })
      if (onSaveSuccess) await onSaveSuccess()
      if (onBack) onBack()
      else router.back()
    } catch (err) {
      Sentry.captureException(err, {
        tags: { area: 'profile_edit_form' },
        extra: {
          student_id: studentId || undefined,
          is_update: Boolean(studentId),
        },
      })
      const errorMessage = getThrownMessage(err)
      posthog.capture('profile_form_submit_failed', {
        student_id: studentId || undefined,
        is_update: Boolean(studentId),
        error_message: errorMessage.slice(0, 500),
      })
      gooeyToast.error('Failed to update profile.', {
        description: errorMessage,
        ...toastSurface,
        timing: { displayDuration: 7000 },
      })
    }
  }, onValidationError)

  const handleBack = (placement: 'header' | 'footer') => {
    captureButtonClick('back', placement)
    setStagedPictureUrl(null)
    setStagedResumeUrl(null)
    form.reset({
      ...toFormValues(student ?? null),
      email: email ?? student?.email ?? '',
    })
    if (onBack) onBack()
    else router.back()
  }

  const isSubmitting = form.formState.isSubmitting

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="textSecondary" type="button" size="md" onClick={() => handleBack('header')}>
          <ArrowLeft className="size-4" /> Back to profile
        </Button>
      </div>
      <LogSnagPageView
          channel="profile"
          description="Profile edit form"
          icon="👤"
        />
      <PosthogCaptureOnce
        event="context_page_viewed"
        properties={{
          channel: 'profile',
          description: 'Profile edit form',
          student_id: studentId || undefined,
        }}
      />

      <form
        id="profile-edit-form"
        noValidate
        onSubmit={handleSubmit}
        className="overflow-hidden rounded-[2rem] border border-white/20 bg-gradient-to-br from-slate-50 via-white to-primary/5 shadow-xl profile-hero-mesh"
      >
        <div className="border-b border-slate-200/60 bg-white/40 px-8 py-6 backdrop-blur-sm lg:px-12">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 lg:text-3xl">
            Edit Profile
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Update your professional information and visibility.
          </p>
        </div>

        <div className="p-8 lg:p-12">
          <ProfileEditFormFields
            formId="profile-edit-form"
            form={form}
            studentId={resolvedStudentId}
            stagedPictureUrl={stagedPictureUrl}
            stagedResumeUrl={stagedResumeUrl}
            onStagedPictureUrl={setStagedPictureUrl}
            onStagedResumeUrl={setStagedResumeUrl}
          />
        </div>

        <div className="flex flex-wrap items-center justify-end gap-4 border-t border-slate-200/60 bg-white/40 px-8 py-6 backdrop-blur-sm lg:px-12">
            <Button variant="tertiary" type="button" size="md" onClick={() => handleBack('footer')}>
              Cancel
            </Button>
          <PrimaryButton
            type="submit"
            form="profile-edit-form"
            disabled={isSubmitting}
            onClick={() => captureButtonClick('save_changes')}
          >
            {isSubmitting ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <Save className="size-5" />
            )}
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </PrimaryButton>
        </div>
      </form>
    </motion.div>
  )
}
