'use client'

import Image from 'next/image'
import { useRef } from 'react'
import { Controller, useFieldArray, type UseFormReturn } from 'react-hook-form'

import { FormInput } from '@/ui/molecules/form-input/FormInput'
import { FormMultiInput } from '@/ui/molecules/form-multi-input/FormMultiInput'
import { joinClassNames } from '@/utils/tailwindUtils'
import {
  FileText,
  Github,
  Globe,
  ImageIcon,
  Linkedin,
  Loader2,
  Plus,
  Rss,
  Trash2,
} from 'lucide-react'

import { FormLabel } from '@/atoms/form-label/FormLabel'
import type { ProfileEditFormValues } from './profileEditFormSchema'
import { useProfileFileUpload } from './useProfileFileUpload'

interface ProfileEditFormFieldsProps {
  formId: string
  form: UseFormReturn<ProfileEditFormValues>
  studentId: string
}

const inputBase =
  'block w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-2 text-sm shadow-sm transition-all placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 text-secondary'

const selectBase =
  'block w-full rounded-lg border border-slate-200 bg-white/80 px-2 py-2 text-sm shadow-sm transition-all placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 text-secondary'

export const ProfileEditFormFields = ({
  formId,
  form,
  studentId,
}: ProfileEditFormFieldsProps) => {
  const { register, control, formState, setValue } = form
  const { errors } = formState
  const { uploadFile, uploading, error } = useProfileFileUpload(studentId)
  const pictureInputRef = useRef<HTMLInputElement>(null)
  const resumeInputRef = useRef<HTMLInputElement>(null)
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'experience',
  })
  const pictureUrl = form.watch('picture')
  const resumeLinkUrl = form.watch('resumeLink')

  return (
    <div className="space-y-6 md:space-y-10">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-10">
        <section className="space-y-4 lg:col-span-2">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-primary">
            Basic Information
          </h3>
          <div className="space-y-2">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6 lg:gap-10">
              <FormLabel
                className="shrink-0 sm:min-w-[8rem]"
                htmlFor={`${formId}-picture`}
              >
                Profile Picture
              </FormLabel>
              <div className="flex min-w-0 flex-1 flex-wrap items-center gap-4">
                {pictureUrl ? (
                  <Image
                    src={pictureUrl}
                    alt="Profile preview"
                    width={64}
                    height={64}
                    className="size-16 shrink-0 rounded-full object-cover"
                  />
                ) : null}
                <div className="min-w-0 flex-1">
                  <input
                    ref={pictureInputRef}
                    id={`${formId}-picture`}
                    type="file"
                    accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      const url = await uploadFile(file, 'picture')
                      if (url) setValue('picture', url, { shouldDirty: true })
                      e.target.value = ''
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => pictureInputRef.current?.click()}
                    disabled={uploading === 'picture'}
                    className={joinClassNames(
                      inputBase,
                      'flex w-full min-w-0 cursor-pointer items-center gap-2 text-left sm:w-auto',
                    )}
                  >
                    {uploading === 'picture' ? (
                      <Loader2 className="size-4 shrink-0 animate-spin" />
                    ) : (
                      <ImageIcon className="size-4 shrink-0" />
                    )}
                    <span className="truncate">
                      {uploading === 'picture'
                        ? 'Uploading...'
                        : 'Choose image (JPG, PNG)'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
            {error ? (
              <span className="block text-xs text-red-600">{error}</span>
            ) : null}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <FormInput
                  id={`${formId}-name`}
                  label="Full Name"
                  type="text"
                  placeholder="John Doe"
                  isRequired
                  className="text-secondary"
                  errorMessage={errors.name?.message}
                  validationStatus={errors.name ? 'invalid' : 'default'}
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                />
              )}
            />
            <FormInput
              id={`${formId}-email`}
              label="Email"
              type="email"
              placeholder="john@example.com"
              isRequired
              className="text-secondary"
              readOnly={true}
              errorMessage={errors.email?.message}
              validationStatus={errors.email ? 'invalid' : 'default'}
              {...register('email')}
            />
            <Controller
              name="role"
              control={control}
              rules={{ required: 'Role is required' }}
              render={({ field }) => (
                <div>
                  <FormLabel htmlFor={`${formId}-role`} isRequired>
                    Role / Title
                  </FormLabel>
                  <select
                    id={`${formId}-role`}
                    className={joinClassNames(
                      selectBase,
                      'text-secondary rounded-sm',
                    )}
                    ref={field.ref}
                    name={field.name}
                    value={String(field.value ?? '')}
                    onBlur={field.onBlur}
                    onChange={(e) => field.onChange(e.target.value)}
                    required
                  >
                    <option value="">Select a role</option>
                    <option value="Frontend Engineer">Frontend Engineer</option>
                    <option value="Backend Engineer">Backend Engineer</option>
                    <option value="FullStack Engineer">
                      FullStack Engineer
                    </option>
                    <option value="Mobile App Developer">
                      Mobile App Developer
                    </option>
                    <option value="Python Developer">
                      Python Developer
                    </option>
                    <option value="UX Designer">
                      UX Designer
                    </option>
                  </select>
                  {errors.role && (
                    <span className="mt-1 block text-xs text-red-600">
                      {errors.role.message}
                    </span>
                  )}
                </div>
              )}
            />

            <Controller
              name="company"
              control={control}
              render={({ field }) => (
                <div>
                  <FormLabel htmlFor={`${formId}-company`}>Company</FormLabel>
                  <select
                    id={`${formId}-company`}
                    className={joinClassNames(selectBase, 'text-secondary')}
                    ref={field.ref}
                    name={field.name}
                    value={String(field.value ?? '')}
                    onBlur={field.onBlur}
                    onChange={(e) => field.onChange(e.target.value)}
                  >
                    <option value="">Select a company</option>
                    <option value="Covai Hello Truck Private Limited">
                      Covai Hello Truck Private Limited
                    </option>
                    <option value="CloseFuture">CloseFuture</option>
                    <option value="Frigate">Frigate</option>
                    <option value="Klyonix Tech">Klyonix Tech</option>
                    <option value="MentorBridge">MentorBridge</option>
                    <option value="Sukiran Solutions Private Limited">
                      Sukiran Solutions Private Limited
                    </option>
                    <option value="Techjays">Techjays</option>
                    <option value="TS Techy">TS Techy</option>
                  </select>
                </div>
              )}
            />

            <Controller
              name="batch"
              control={control}
              rules={{ required: 'Batch is required' }}
              render={({ field }) => (
                <div>
                  <FormLabel htmlFor={`${formId}-batch`} isRequired>
                    Cohort Batch
                  </FormLabel>
                  <select
                    id={`${formId}-batch`}
                    className={joinClassNames(
                      selectBase,
                      'text-secondary rounded-sm',
                    )}
                    ref={field.ref}
                    name={field.name}
                    value={String(field.value ?? '')}
                    onBlur={field.onBlur}
                    onChange={(e) => field.onChange(e.target.value)}
                    required
                  >
                    <option value="">Select a cohort</option>
                    <option value="2028">2028</option>
                    <option value="2027">2027</option>
                    <option value="2026">2026</option>
                    <option value="2025">2025</option>
                  </select>
                  {errors.batch && (
                    <span className="mt-1 block text-xs text-red-600">
                      {errors.batch.message}
                    </span>
                  )}
                </div>
              )}
            />

            <Controller
              name="gender"
              control={control}
              render={({ field }) => (
                <div>
                  <FormLabel htmlFor={`${formId}-gender`}>Gender</FormLabel>
                  <select
                    id={`${formId}-gender`}
                    className={joinClassNames(selectBase, 'text-secondary')}
                    ref={field.ref}
                    name={field.name}
                    value={String(field.value ?? '')}
                    onBlur={field.onBlur}
                    onChange={(e) => field.onChange(e.target.value)}
                  >
                    <option value="">Select gender</option>
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                  </select>
                </div>
              )}
            />
          </div>
          <div>
            <label
              htmlFor={`${formId}-summary`}
              className="mb-1.5 block text-sm font-medium uppercase tracking-wide text-slate-600"
            >
              Summary
            </label>
            <textarea
              id={`${formId}-summary`}
              rows={6}
              placeholder="Brief professional summary..."
              className={joinClassNames(
                inputBase,
                'resize-none text-secondary',
              )}
              {...register('summary')}
            />
          </div>
        </section>
        <section className="space-y-4 ">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-primary">
            Social & Links
          </h3>
          <div className="grid gap-4">
            <div>
              <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-slate-600">
                <Linkedin className="size-4" /> LinkedIn
              </label>
              <input
                type="url"
                placeholder="https://linkedin.com/in/username"
                className={joinClassNames(inputBase, 'text-secondary')}
                {...register('socialLinks.linkedIn')}
              />
            </div>
            <div>
              <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-slate-600">
                <Github className="size-4" /> GitHub
              </label>
              <input
                type="url"
                placeholder="https://github.com/username"
                className={joinClassNames(inputBase, 'text-secondary')}
                {...register('socialLinks.gitHub')}
              />
            </div>
            <div>
              <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-slate-600">
                <Globe className="size-4" /> Website
              </label>
              <input
                type="url"
                placeholder="https://..."
                className={joinClassNames(inputBase, 'text-secondary')}
                {...register('socialLinks.website')}
              />
            </div>
            <div>
              <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-slate-600">
                <Rss className="size-4" /> Medium
              </label>
              <input
                type="text"
                id={`${formId}-mediumUsername`}
                placeholder="username"
                className={joinClassNames(inputBase, 'text-secondary')}
                {...register('mediumUsername')}
              />
            </div>
          </div>
          <div>
            <label
              htmlFor={`${formId}-resumeLink`}
              className="mb-1.5 block text-sm font-medium uppercase tracking-wide text-slate-600"
            >
              Resume
            </label>
            <div className="flex flex-col gap-2">
              <input
                ref={resumeInputRef}
                id={`${formId}-resumeLink`}
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  const url = await uploadFile(file, 'resume')
                  if (url) setValue('resumeLink', url, { shouldDirty: true })
                  e.target.value = ''
                }}
              />
              <button
                type="button"
                onClick={() => resumeInputRef.current?.click()}
                disabled={uploading === 'resume'}
                className={joinClassNames(
                  inputBase,
                  'flex w-full min-w-0 cursor-pointer items-center gap-2 text-left sm:w-auto',
                )}
              >
                {uploading === 'resume' ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <FileText className="size-4" />
                )}
                {uploading === 'resume' ? 'Uploading...' : 'Choose PDF file'}
              </button>
              {resumeLinkUrl ? (
                <a
                  href={resumeLinkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline"
                >
                  View current resume
                </a>
              ) : null}
            </div>
          </div>
        </section>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-10">
        <section className="space-y-4 lg:col-span-2">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-primary">
              Professional Experience
            </h3>
            <button
              type="button"
              onClick={() =>
                append({ company: '', role: '', summary: '', website: '' })
              }
              className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-lg bg-primary/10 px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/20 sm:self-auto"
            >
              <Plus className="size-4" /> Add
            </button>
          </div>
          <div className="space-y-4">
            {fields.map((field, idx) => (
              <div
                key={field.id}
                className="rounded-xl border border-slate-200 bg-white/60 p-4 shadow-sm sm:p-5"
              >
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-medium text-slate-500">
                    Experience #{idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => remove(idx)}
                    className="rounded p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
                    aria-label="Remove"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormInput
                    id={`${formId}-exp-company-${idx}`}
                    label="Company"
                    placeholder="Company name"
                    {...register(`experience.${idx}.company`)}
                    className="text-secondary"
                  />
                  <FormInput
                    id={`${formId}-exp-role-${idx}`}
                    label="Role"
                    placeholder="Job title"
                    {...register(`experience.${idx}.role`)}
                    className="text-secondary"
                  />
                </div>
                <div className="mt-4">
                  <label className="mb-1.5 block text-sm font-medium text-slate-600">
                    Summary
                  </label>
                  <textarea
                    rows={6}
                    placeholder="Describe your role..."
                    className={joinClassNames(
                      inputBase,
                      'resize-none mt-1 text-secondary',
                    )}
                    {...register(`experience.${idx}.summary`)}
                  />
                </div>
                <div className="mt-4">
                  <FormInput
                    id={`${formId}-exp-website-${idx}`}
                    label="Website"
                    type="url"
                    placeholder="https://..."
                    {...register(`experience.${idx}.website`)}
                    className="text-secondary"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
        <section className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-primary">
            Skills & Inspirations
          </h3>
          <Controller
            name="skillSets"
            control={control}
            render={({ field }) => (
              <FormMultiInput
                id={`${formId}-skillSets`}
                label="Skills"
                value={
                  field.value
                    ? field.value
                        .split(',')
                        .map((s) => s.trim())
                        .filter(Boolean)
                    : []
                }
                onChange={(tags) => field.onChange(tags.join(', '))}
                onBlur={field.onBlur}
                placeholder="React, TypeScript, Node.js"
                maxTags={15}
                errorMessage={errors.skillSets?.message}
                validationStatus={errors.skillSets ? 'invalid' : 'default'}
              />
            )}
          />
          <Controller
            name="inspirations"
            control={control}
            render={({ field }) => (
              <FormMultiInput
                id={`${formId}-inspirations`}
                label="Inspirations"
                value={
                  field.value
                    ? field.value
                        .split(',')
                        .map((s) => s.trim())
                        .filter(Boolean)
                    : []
                }
                onChange={(tags) => field.onChange(tags.join(', '))}
                onBlur={field.onBlur}
                placeholder="Kalam, Sachin, Elon Musk..."
                maxTags={15}
                errorMessage={errors.inspirations?.message}
                validationStatus={errors.inspirations ? 'invalid' : 'default'}
              />
            )}
          />
        </section>
      </div>
    </div>
  )
}
