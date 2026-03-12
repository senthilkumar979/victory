'use client'

import { Breadcrumbs } from '@/atoms/breadcrumbs/Breadcrumbs'
import { Button } from '@/atoms/button/Button'
import { Loader } from '@/atoms/loader/Loader'
import { StudentProfileView } from '@/components/profile/StudentProfileView'
import { useStudent } from '@/hooks/useStudent'
import { StudentNotFound } from '@/templates/StudentNotFound'
import { Pencil } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

export default function ProfileEditPage() {
  const params = useParams()
  const id = typeof params?.id === 'string' ? params.id : ''
  const { student, loading, error } = useStudent(id)

  if (!id) {
    return <StudentNotFound message="Invalid student ID." />
  }

  if (loading) {
    return <Loader isShow={loading} />
  }

  if (error) {
    return (
      <StudentNotFound
        message={'Something went wrong while fetching the student.'}
      />
    )
  }

  return (
    <div className="min-h-screen w-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-100 via-white to-slate-50">
      {student && (
        <div className="mx-auto w-full max-w-[1600px] px-4 py-10 sm:px-6 lg:px-10 xl:px-14">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Breadcrumbs
              items={[
                { label: 'Students', href: '/secured/admin#students' },
                {
                  label: student?.name,
                  href: `/student-detail/${student?.id}`,
                },
              ]}
            />
            <Link href={`/profile/${student?.id}/edit`}>
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
      )}
    </div>
  )
}
