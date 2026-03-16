'use client'

import { useUser } from '@clerk/nextjs'
import { useEffect, useState } from 'react'

import { PrimaryButton } from '@/atoms/button/Button'
import { useCheckIsAuthenticated } from '@/hooks/useCheckIsAuthenticated'
import { supabase } from '@/lib/supabaseClient'
import { ProfileData } from '@/types/student.types'
import { BotIcon, Pencil } from 'lucide-react'
import { StudentProfileView } from '../../../components/profile/StudentProfileView'
import { ProfileEditForm } from '../../profile/[id]/edit/ProfileEditForm'

const getPrimaryEmail = (user: ReturnType<typeof useUser>['user'] | null) => {
  if (!user) return null
  const primary = user.emailAddresses.find(
    (e) => e.id === user.primaryEmailAddressId,
  )
  return primary?.emailAddress ?? user.emailAddresses[0]?.emailAddress ?? null
}

const ProfilePage = () => {
  useCheckIsAuthenticated()
  const { user } = useUser()
  const [student, setStudent] = useState<ProfileData | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)

  const email = getPrimaryEmail(user)

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const { data, error } = await supabase
          .from('students')
          .select('*')
          .eq('email', email)
          .maybeSingle()
        if (error || !data?.name) {
          console.error('Error fetching student:', error)
          setStudent(null)
          setIsEditMode(true)
        } else if (data?.name) {
          setStudent(data)
          setIsEditMode(false)
        }
      } catch (error) {
        console.error('Error fetching student:', error)
        setStudent(null)
        setIsEditMode(true)
      }
    }

    if (!email) return
    fetchStudent()
  }, [email, user])

  return (
    <div className="min-h-screen w-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-100 via-white to-slate-50">
      <div className="mx-auto w-full max-w-[1600px] px-4 py-10 sm:px-6 lg:px-10 xl:px-14">
        {isEditMode ? (
          <ProfileEditForm
            student={student ?? null}
            studentId={student?.id ?? ''}
            email={email}
            onBack={() => setIsEditMode(false)}
          />
        ) : (
          <>
            <div className="flex justify-end">
              <div className="flex items-center gap-2">
                <PrimaryButton size="sm" mode="outline">
                  <BotIcon className="size-4" />
                  Generate Self Intro
                </PrimaryButton>
                <PrimaryButton
                  mode="outline"
                  size="sm"
                  onClick={() => setIsEditMode(true)}
                >
                  <Pencil className="size-4" />
                  Edit Profile
                </PrimaryButton>
              </div>
            </div>
            <div className="mt-8">
              {student && <StudentProfileView student={student} />}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default ProfilePage
