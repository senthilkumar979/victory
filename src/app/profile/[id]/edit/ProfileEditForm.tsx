'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'

import { useUpdateStudent } from '@/hooks/useUpdateStudent'
import { Button } from '@/ui/atoms/button/Button'
import { motion } from 'framer-motion'
import { gooeyToast } from 'goey-toast'
import { ArrowLeft, Loader2, Save } from 'lucide-react'

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
    resumeLink: student.resumeLink ?? '',
    skillSets: student.skillSets?.join(', ') ?? '',
    inspirations: student.inspirations?.join(', ') ?? '',
    experience: student.experience ?? [],
    mentorBridgeExp: student.mentorBridgeExp,
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

interface ProfileEditFormProps {
  student: ProfileData
  studentId: string
}

export const ProfileEditForm = ({ student, studentId }: ProfileEditFormProps) => {
  const router = useRouter()
  const { updateStudent } = useUpdateStudent()
  const form = useForm<ProfileEditFormValues>({
    resolver: zodResolver(profileEditFormSchema),
    defaultValues: toFormValues(student),
    mode: 'onTouched',
  })

  useEffect(() => {
    form.reset(toFormValues(student))
  }, [student, form])

  const handleSubmit = form.handleSubmit(async (data) => {
    try {
      const skillSets = parseCommaList(data.skillSets)
      const inspirations = parseCommaList(data.inspirations)
      const socialLinks =
        data.socialLinks?.linkedIn || data.socialLinks?.gitHub || data.socialLinks?.website
          ? {
              linkedIn: data.socialLinks.linkedIn || '',
              gitHub: data.socialLinks.gitHub || '',
              website: data.socialLinks.website || '',
            }
          : undefined

      const validExperience = data.experience?.filter(
        (e) => e.company?.trim() || e.role?.trim()
      )

      await updateStudent(studentId, {
        name: data.name,
        picture: data.picture || undefined,
        role: data.role,
        company: data.company || undefined,
        summary: data.summary || undefined,
        email: data.email,
        mediumUsername: data.mediumUsername || undefined,
        batch: data.batch,
        resumeLink: data.resumeLink || undefined,
        skillSets: skillSets.length > 0 ? skillSets : undefined,
        inspirations: inspirations.length > 0 ? inspirations : undefined,
        experience: validExperience?.length ? validExperience : undefined,
        mentorBridgeExp: data.mentorBridgeExp,
        socialLinks,
      })

      gooeyToast.success('Profile updated successfully.', {
        description: `${data.name}'s profile has been saved.`,
        bounce: 0.45,
        borderColor: '#E0E0E0',
        borderWidth: 2,
        timing: { displayDuration: 5000 },
      })
      router.push(`/student-detail/${studentId}`)
    } catch (err) {
      console.error(err)
      gooeyToast.error('Failed to update profile.', {
        description: err instanceof Error ? err.message : 'Please try again.',
      })
    }
  })

  const isSubmitting = form.formState.isSubmitting

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href={`/student-detail/${studentId}`}
          className="inline-flex w-fit items-center gap-2 text-sm font-medium text-slate-600 transition-colors hover:text-primary"
        >
          <ArrowLeft className="size-4" /> Back to profile
        </Link>
      </div>

      <form
        id="profile-edit-form"
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
            studentId={studentId}
          />
        </div>

        <div className="flex flex-wrap items-center justify-end gap-4 border-t border-slate-200/60 bg-white/40 px-8 py-6 backdrop-blur-sm lg:px-12">
          <Link href={`/student-detail/${studentId}`}>
            <Button variant="tertiary" type="button" size="md">
              Cancel
            </Button>
          </Link>
          <Button
            variant="primary"
            size="lg"
            type="submit"
            form="profile-edit-form"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <Save className="size-5" />
            )}
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </motion.div>
  )
}
