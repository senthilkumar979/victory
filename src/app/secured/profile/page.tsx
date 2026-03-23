'use client'

import { useUser } from '@clerk/nextjs'
import { useCallback, useEffect, useState } from 'react'

import { Button, PrimaryButton } from '@/atoms/button/Button'
import { useCheckIsAuthenticated } from '@/hooks/useCheckIsAuthenticated'
import { useSelfIntroLimit } from '@/hooks/useSelfIntroLimit'
import { supabase } from '@/lib/supabaseClient'
import { ProfileData } from '@/types/student.types'
import { Drawer } from '@/ui/organisms/drawer/Drawer'
import { gooeyToast } from 'goey-toast'
import { BotIcon, Loader2, Pencil } from 'lucide-react'

import { ProfileEditForm } from '@/app/profile/[id]/edit/ProfileEditForm'
import { StudentProfileView } from '@/components/profile/StudentProfileView'
import { safeJsonParse } from '@/utils/parseUtils'

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
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [selfIntro, setSelfIntro] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const { canGenerate, remaining, incrementCount } = useSelfIntroLimit()

  const email = getPrimaryEmail(user)

  const handleGenerateSelfIntro = useCallback(async () => {
    if (!canGenerate) {
      gooeyToast.error('Daily limit reached', {
        description:
          'You can generate up to 2 self-intros per day. Try again tomorrow.',
        bounce: 0.45,
        borderColor: '#E0E0E0',
        borderWidth: 2,
      })
      return
    }
    if (!student) {
      gooeyToast.error('Profile not loaded', {
        description: 'Please wait for your profile to load.',
        bounce: 0.45,
        borderColor: '#E0E0E0',
        borderWidth: 2,
      })
      return
    }

    setIsGenerating(true)
    try {
      const res = await fetch('/api/generate-self-intro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(student),
      })
      const data = (await res.json()) as { selfIntro?: string; error?: string }

      if (!res.ok) {
        throw new Error(data.error ?? 'Failed to generate self-intro')
      }
      if (!data.selfIntro) throw new Error('No content generated')

      incrementCount()
      const introText = data.selfIntro
      setSelfIntro(introText)
      setIsDrawerOpen(true)

      const { error } = await supabase
        .from('students')
        .update({ self_intro: introText })
        .eq('id', student.id)

      if (error) {
        console.error('Failed to save self-intro to profile:', error)
        gooeyToast.error('Could not save to profile', {
          description:
            'Self-intro was generated but not saved. Please try again.',
          bounce: 0.45,
          borderColor: '#E0E0E0',
          borderWidth: 2,
        })
      } else {
        setStudent((prev) => (prev ? { ...prev, selfIntro: introText } : null))
      }
    } catch (err) {
      gooeyToast.error('Failed to generate self-intro', {
        description: err instanceof Error ? err.message : 'Please try again.',
        bounce: 0.45,
        borderColor: '#E0E0E0',
        borderWidth: 2,
        timing: { displayDuration: 3000 },
      })
    } finally {
      setIsGenerating(false)
    }
  }, [canGenerate, student, incrementCount])

  const openSelfIntroDrawer = useCallback(() => {
    if (student?.selfIntro) {
      setSelfIntro(student.selfIntro)
      setIsDrawerOpen(true)
    }
  }, [student?.selfIntro])

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
          setStudent({
            ...data,
            experience: safeJsonParse(data.experience, []),
            mentorBridgeExp: safeJsonParse(data.mentor_bridge_exp, {}),
            skillSets: safeJsonParse(data.skill_sets, []) as string[],
            inspirations: safeJsonParse(data.inspirations, []) as string[],
            socialLinks: safeJsonParse(data.social_links, {}),
            selfIntro:
              (data as { self_intro?: string }).self_intro ?? undefined,
            serialNo: Number((data as { serial_no?: number }).serial_no) || 0,
          })
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
  }, [email])

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
                {student?.selfIntro ? (
                  <Button
                    variant="success"
                    mode="outline"
                    size="sm"
                    onClick={openSelfIntroDrawer}
                  >
                    Self Introduction
                  </Button>
                ) : null}
                <Button
                  variant="textInfo"
                  size="sm"
                  onClick={handleGenerateSelfIntro}
                  disabled={isGenerating || !canGenerate}
                >
                  {isGenerating ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <BotIcon className="size-4" />
                  )}
                  Generate Self Intro{' '}
                  {remaining > 0 ? `(${remaining} left)` : ''}
                </Button>
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

      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        size="xl"
      >
        <Drawer.Title description="AI-generated self-introduction based on your profile.">
          Self Introduction
        </Drawer.Title>
        <Drawer.Body>
          {selfIntro ? (
            <div className="whitespace-pre-wrap">{selfIntro}</div>
          ) : null}
        </Drawer.Body>
      </Drawer>
    </div>
  )
}

export default ProfilePage
