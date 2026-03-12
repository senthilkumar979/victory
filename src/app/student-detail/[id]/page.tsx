'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'

import { Breadcrumbs } from '@/atoms/breadcrumbs/Breadcrumbs'
import { StudentProfileView } from '@/components/profile/StudentProfileView'
import { useStudent } from '@/hooks/useStudent'
import { Button, PrimaryButton } from '@/ui/atoms/button/Button'
import { Pencil, UserIcon } from 'lucide-react'

const StudentNotFound = ({ message }: { message: string }) => {
  return (
    <div className="min-h-screen px-20 py-12">
      <div className=" flex items-center justify-center gap-5 flex-col rounded-xl border border-slate-200 bg-slate-50 p-10 text-center text-slate-600">
        <UserIcon className="size-10" />
        {message}
        <PrimaryButton onClick={() => window.history.back()} size="sm">
          Go Back
        </PrimaryButton>
      </div>
    </div>
  )
}

export default function StudentDetailPage() {
  const params = useParams()
  const id = typeof params?.id === 'string' ? params.id : ''
  const { student, loading, error } = useStudent(id)

  if (!id) {
    return <StudentNotFound message="Invalid student ID." />
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
      <StudentNotFound
        message={'Something went wrong while fetching the student.'}
      />
    )
  }

  if (!student) {
    return <StudentNotFound message="Student not found." />
  }

  return (
    <div className="min-h-screen w-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-100 via-white to-slate-50">
      <div className="mx-auto w-full max-w-[1600px] px-4 py-10 sm:px-6 lg:px-10 xl:px-14">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Breadcrumbs
            items={[
              { label: 'Students', href: '/secured/admin#students' },
              { label: student.name, href: `/student-detail/${student.id}` },
            ]}
          />
          <Link href={`/profile/${student.id}/edit`}>
            <Button variant="primary" mode="outline" size="sm">
              <Pencil className="size-4" />
              Edit Profile
            </Button>
          </Link>
        </div>
        <div className="mt-8">
          <StudentProfileView student={student} />
        </div>
      </div>
    </div>
  )
}
