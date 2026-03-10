'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'

import { useStudent } from '@/hooks/useStudent'

import { ProfileEditForm } from './ProfileEditForm'

export default function ProfileEditPage() {
  const params = useParams()
  const id = typeof params?.id === 'string' ? params.id : ''
  const { student, loading, error } = useStudent(id)

  if (!id) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="rounded-2xl border border-red-200 bg-red-50/80 p-8 text-center">
          <p className="text-red-800">Invalid student ID.</p>
          <Link
            href="/secured/admin"
            className="mt-4 inline-block font-medium text-primary hover:underline"
          >
            Back to Admin
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-100 via-white to-slate-50">
        <div className="mx-auto max-w-[900px] px-4 py-16 sm:px-6 lg:px-10">
          <div className="animate-pulse space-y-8">
            <div className="h-8 w-48 rounded-lg bg-slate-200" />
            <div className="h-96 rounded-[2rem] bg-slate-200/80" />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="rounded-2xl border border-red-200 bg-red-50/80 p-8 text-center">
          <p className="text-red-800">{error}</p>
          <Link
            href="/secured/admin"
            className="mt-4 inline-block font-medium text-primary hover:underline"
          >
            Back to Admin
          </Link>
        </div>
      </div>
    )
  }

  if (!student) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-8 text-center">
          <p className="text-slate-600">Student not found.</p>
          <Link
            href="/secured/admin"
            className="mt-4 inline-block font-medium text-primary hover:underline"
          >
            Back to Admin
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-100 via-white to-slate-50">
      <div className="mx-auto px-4 py-10 sm:px-6 lg:px-10 lg:max-w-[1200px]">
        <ProfileEditForm student={student} studentId={id} />
      </div>
    </div>
  )
}
