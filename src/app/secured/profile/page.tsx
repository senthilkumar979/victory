'use client'

import { useUser } from '@clerk/nextjs'
import { useEffect, useState } from 'react'

import { useCheckIsAuthenticated } from '@/hooks/useCheckIsAuthenticated'
import { supabase } from '@/lib/supabaseClient'
import { ProfileData } from '@/types/student.types'
import { StudentProfileView } from '../../../components/profile/StudentProfileView'

const getPrimaryEmail = (
  user: NonNullable<ReturnType<typeof useUser>['user']>,
) => {
  const primary = user.emailAddresses.find(
    (e) => e.id === user.primaryEmailAddressId,
  )
  return primary?.emailAddress ?? user.emailAddresses[0]?.emailAddress ?? null
}

const ProfilePage = () => {
  useCheckIsAuthenticated()
  const { user, isLoaded } = useUser()
  const [student, setStudent] = useState<ProfileData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!isLoaded || !user) {
      setIsLoading(false)
      return
    }

    const email = getPrimaryEmail(user)
    if (!email) {
      setIsLoading(false)
      return
    }

    const fetchStudent = async () => {
      try {
        const { data, error } = await supabase
          .from('students')
          .select('*')
          .eq('email', email)
          .maybeSingle()

        if (error) {
          console.error('Error fetching student:', error)
          setStudent(null)
        } else if (data?.name) {
          setStudent(data)
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchStudent()
  }, [user, isLoaded])

  return isLoading ? (
    <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading...</p>
  ) : student ? (
    <div className="min-h-screen w-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-100 via-white to-slate-50">
      <div className="mx-auto w-full max-w-[1600px] px-4 py-10 sm:px-6 lg:px-10 xl:px-14">
        <div className="mt-8">
          <StudentProfileView student={student} />
        </div>
      </div>
    </div>
  ) : (
    <div className="min-h-screen w-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-100 via-white to-slate-50">
      <div className="mx-auto w-full max-w-[1600px] px-4 py-10 sm:px-6 lg:px-10 xl:px-14">
        <div className="mt-8 text-slate-500">No student found</div>
      </div>
    </div>
  )
}

export default ProfilePage
