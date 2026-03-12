'use client'

import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

import { Badge } from '@/atoms/badge/Badge'
import { SocialLinks } from '@/templates/SocialLinks'
import type { ProfileData } from '@/types/student.types'
import { joinClassNames } from '@/utils/tailwindUtils'
import Image from 'next/image'

interface StudentCardProps {
  student: ProfileData
  index: number
}

const ProfilePicture = ({
  picture,
  name,
  isRounded = false,
}: {
  picture: string
  name: string
  isRounded?: boolean
}) => {
  return picture ? (
    <Image
      loading="lazy"
      src={picture}
      alt={name}
      width={300}
      height={300}
      className={joinClassNames(
        'h-full w-full object-cover',
        isRounded && 'rounded-xl',
      )}
    />
  ) : (
    <div
      className={joinClassNames(
        'flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/50 to-slate-800 text-6xl font-bold text-white',
        isRounded && 'rounded-xl',
      )}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  )
}

export const StudentCard = ({ student, index }: StudentCardProps) => {
  const { id, name, picture, role, company, batch, socialLinks } = student
  const [isFlipped, setIsFlipped] = useState(false)

  return (
    <motion.article
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.45,
        delay: index * 0.05,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{
        y: -6,
        transition: { type: 'spring', stiffness: 380, damping: 22 },
      }}
      whileTap={{ scale: 0.99 }}
      className="group relative"
    >
      <Link href={`/students/${id}`} className="block">
        <div
          className="relative w-full overflow-hidden rounded-2xl shadow-xl [perspective:1000px] sm:h-72 lg:h-112"
          onMouseEnter={() => setIsFlipped(true)}
          onMouseLeave={() => setIsFlipped(false)}
        >
          <motion.div
            className="relative h-full w-full"
            style={{ transformStyle: 'preserve-3d' }}
            initial={false}
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 30,
            }}
          >
            {/* Front: Image with name on top */}
            <div
              className="absolute inset-0 cursor-pointer"
              style={{
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
              }}
            >
              <div className="relative h-full w-full overflow-hidden rounded-2xl bg-slate-800">
                <ProfilePicture picture={picture} name={name} />
                {/* Name overlay at top */}
                <div className="absolute inset-x-0 top-0 bg-gradient-to-b from-black/70 via-black/40 to-transparent p-4 pt-5">
                  <h3 className="text-lg font-bold tracking-tight text-white drop-shadow-sm sm:text-xl">
                    {name}
                  </h3>
                </div>
              </div>
            </div>

            {/* Back: Details */}
            <div
              className="absolute inset-0 flex flex-col justify-between rounded-2xl bg-gradient-to-br from-primary/10 via-primary/50 to-primary/90 p-5 sm:p-6"
              style={{
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
              }}
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-base font-bold tracking-tight text-primary sm:text-lg">
                  {name}
                </h3>
                <div className="rounded-lg bg-primary/20 p-2 ring-1 ring-primary/30">
                  <ArrowUpRight
                    className="size-4 text-primary sm:size-5"
                    strokeWidth={2}
                  />
                </div>
              </div>
              <div className="h-48 w-48 rounded-full mx-auto mb-5">
                <ProfilePicture picture={picture} name={name} isRounded />
              </div>
              <div className="space-y-5 text-center">
                {role && (
                  <h6 className="text-lg uppercase font-medium text-white">
                    {role}
                  </h6>
                )}
                <div className="flex flex-wrap gap-2 justify-center items-center">
                  <motion.div className="flex flex-wrap items-center gap-3 text-lg text-slate-600">
                    <Badge color="info" variant="solid">
                      {company ?? 'MentorBridge'}
                    </Badge>
                  </motion.div>
                  {batch && (
                    <Badge color="success" variant="solid">
                      {batch}
                    </Badge>
                  )}
                </div>
                {socialLinks &&
                  (socialLinks.linkedIn ||
                    socialLinks.gitHub ||
                    socialLinks.website) && (
                    <div
                      className="flex items-center gap-1 justify-center items-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <SocialLinks socialLinks={socialLinks} />
                    </div>
                  )}
              </div>
            </div>
          </motion.div>
        </div>
      </Link>
    </motion.article>
  )
}
