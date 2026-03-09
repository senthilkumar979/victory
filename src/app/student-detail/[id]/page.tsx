'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'

import { StudentProfileView } from '@/components/profile/StudentProfileView'
import { useStudent } from '@/hooks/useStudent'
import { Breadcrumbs } from '../../../ui/atoms/breadcrumbs/Breadcrumbs'

export default function StudentDetailPage() {
  const params = useParams()
  const id = typeof params?.id === 'string' ? params.id : ''
  const { student, loading, error } = useStudent(id)

  if (!id) {
    return (
      <div className="min-h-screen px-6 py-8">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-800">
          Invalid student ID.
          <Link
            href="/secured/admin"
            className="ml-2 font-medium text-primary hover:underline"
          >
            Back to Students
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen w-full px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-[1600px] animate-pulse space-y-6">
          <div className="h-56 rounded-2xl bg-slate-200/80" />
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <div className="h-40 rounded-2xl bg-slate-200/80" />
              <div className="h-32 rounded-2xl bg-slate-200/80" />
            </div>
            <div className="h-48 rounded-2xl bg-slate-200/80" />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen px-6 py-8">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-800">
          {error}
          <Link
            href="/secured/admin"
            className="ml-2 font-medium text-primary hover:underline"
          >
            Back to Students
          </Link>
        </div>
      </div>
    )
  }

  if (!student) {
    return (
      <div className="min-h-screen px-6 py-8">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center text-slate-600">
          Student not found.
          <Link
            href="/secured/admin"
            className="ml-2 font-medium text-primary hover:underline"
          >
            Back to Students
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-100 via-white to-slate-50">
      <div className="mx-auto w-full max-w-[1600px] px-4 py-10 sm:px-6 lg:px-10 xl:px-14">
        <Breadcrumbs
          items={[
            { label: 'Students', href: '/secured/admin#students' },
            { label: student.name, href: `/student-detail/${student.id}` },
          ]}
        />
        <div className="mt-8">
          <StudentProfileView student={student} />
        </div>
      </div>
    </div>
  )
}
