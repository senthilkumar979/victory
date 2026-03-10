'use client'

import { useFieldArray, UseFormReturn } from 'react-hook-form'

import { FormInput } from '@/ui/molecules/form-input/FormInput'
import { joinClassNames } from '@/utils/tailwindUtils'
import { Github, Globe, Linkedin, Plus, Rss, Trash2 } from 'lucide-react'

import type { ProfileEditFormValues } from './profileEditFormSchema'

interface ProfileEditFormFieldsProps {
  formId: string
  form: UseFormReturn<ProfileEditFormValues>
}

const inputBase =
  'block w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-2 text-sm shadow-sm transition-all placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 text-secondary'

export const ProfileEditFormFields = ({
  formId,
  form,
}: ProfileEditFormFieldsProps) => {
  const { register, control, formState } = form
  const { errors } = formState
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'experience',
  })

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-3 gap-10">
        <section className="space-y-4 col-span-2">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-primary">
            Basic Information
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormInput
              id={`${formId}-name`}
              label="Full Name"
              type="text"
              placeholder="John Doe"
              isRequired
              className="text-secondary"
              errorMessage={errors.name?.message}
              validationStatus={errors.name ? 'invalid' : 'default'}
              {...register('name')}
            />
            <FormInput
              id={`${formId}-email`}
              label="Email"
              type="email"
              placeholder="john@example.com"
              isRequired
              className="text-secondary"
              errorMessage={errors.email?.message}
              validationStatus={errors.email ? 'invalid' : 'default'}
              {...register('email')}
            />
            <div>
              <label
                htmlFor={`${formId}-role`}
                className="mb-1.5 block text-sm font-medium uppercase tracking-wide text-slate-600"
              >
                Role / Title<span className="text-red-500">*</span>
              </label>
              <select
                id={`${formId}-role`}
                className={joinClassNames(inputBase, 'text-secondary')}
                {...register('role')}
                required
              >
                <option value="">Select a role</option>
                <option value="Frontend Engineer">Frontend Engineer</option>
                <option value="Backend Engineer">Backend Engineer</option>
                <option value="Full Stack Engineer">Full Stack Engineer</option>
                <option value="Mobile App Developer">
                  Mobile App Developer
                </option>
              </select>
              {errors.role && (
                <span className="mt-1 block text-xs text-red-600">
                  {errors.role.message}
                </span>
              )}
            </div>

            <div>
              <label
                htmlFor={`${formId}-company`}
                className="mb-1.5 block text-sm font-medium uppercase tracking-wide text-slate-600"
              >
                Company
              </label>
              <select
                id={`${formId}-company`}
                className={joinClassNames(inputBase, 'text-secondary')}
                {...register('company')}
              >
                <option value="">Select a company</option>
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
            <FormInput
              id={`${formId}-batch`}
              label="Cohort Batch"
              type="text"
              placeholder="2024"
              isRequired
              className="text-secondary"
              errorMessage={errors.batch?.message}
              validationStatus={errors.batch ? 'invalid' : 'default'}
              {...register('batch')}
            />
            <FormInput
              id={`${formId}-picture`}
              label="Profile Picture URL"
              type="url"
              placeholder="https://..."
              className="text-secondary"
              {...register('picture')}
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
          <div className="grid gap-4 sm:grid-cols-1">
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
          <FormInput
            id={`${formId}-resumeLink`}
            label="Resume URL"
            type="url"
            placeholder="https://..."
            className="text-secondary"
            {...register('resumeLink')}
          />
        </section>
      </div>
      <div className="grid grid-cols-3 gap-10">
        <section className="space-y-4 col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-primary">
              Professional Experience
            </h3>
            <button
              type="button"
              onClick={() =>
                append({ company: '', role: '', summary: '', website: '' })
              }
              className="flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
            >
              <Plus className="size-4" /> Add
            </button>
          </div>
          <div className="space-y-4">
            {fields.map((field, idx) => (
              <div
                key={field.id}
                className="rounded-xl border border-slate-200 bg-white/60 p-5 shadow-sm"
              >
                <div className="mb-4 flex items-center justify-between">
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
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-600">
              Skills (comma-separated)
            </label>
            <input
              type="text"
              placeholder="React, TypeScript, Node.js"
              className={joinClassNames(inputBase, 'text-secondary')}
              {...register('skillSets')}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-600">
              Inspirations (comma-separated)
            </label>
            <input
              type="text"
              placeholder="Books, people, concepts..."
              className={joinClassNames(inputBase, 'text-secondary')}
              {...register('inspirations')}
            />
          </div>
        </section>
      </div>
    </div>
  )
}
