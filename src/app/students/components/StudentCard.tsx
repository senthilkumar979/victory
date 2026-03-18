'use client'

import { motion, AnimatePresence, Variants } from 'framer-motion'
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
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="h-full w-full"
    >
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
    </motion.div>
  ) : (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className={joinClassNames(
        'flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/50 to-slate-800 text-6xl font-bold text-white',
        isRounded && 'rounded-xl',
      )}
    >
      {name.charAt(0).toUpperCase()}
    </motion.div>
  )
}

const overlayVariants = {
  initial: { opacity: 0, y: -12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.2 } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.25 } },
}

const badgeVariants = {
  initial: { scale: 0.85, opacity: 0, y: 10 },
  animate: {
    scale: 1,
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 340, damping: 18, delay: 0.2 },
  },
  exit: { scale: 0.85, opacity: 0, y: 10, transition: { duration: 0.18 } },
}

const nameVariants = {
  initial: { opacity: 0, y: -15 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.38, delay: 0.17, ease: [0.22, 1, 0.36, 1] },
  },
  exit: { opacity: 0, y: -15, transition: { duration: 0.2 } },
}

export const StudentCard = ({ student, index }: StudentCardProps) => {
  const { id, name, picture, role, company, batch, socialLinks } = student
  const [isFlipped, setIsFlipped] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.article
      initial={{ opacity: 0, y: 30, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{
        duration: 0.45,
        delay: index * 0.07,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{
        y: -10,
        boxShadow: '0 12px 36px 0 rgba(31,36,80,0.09)',
        scale: 1.025,
        transition: { type: 'spring', stiffness: 480, damping: 22 },
      }}
      whileTap={{ scale: 0.99 }}
      // Remove all device hiding classes and ensure it's visible on all screens
      className="group relative"
    >
      <Link href={`/students/${id}`} className="block">
        <div
          // Remove any sm: or hidden/mobile-hiding class for universal visibility
          className="relative w-full overflow-hidden rounded-2xl shadow-xl [perspective:1000px] h-72 lg:h-112"
          onMouseEnter={() => {
            setIsFlipped(true)
            setIsHovered(true)
          }}
          onMouseLeave={() => {
            setIsFlipped(false)
            setIsHovered(false)
          }}
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
                <AnimatePresence>
                  {!isFlipped && (
                    <motion.div
                      variants={overlayVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      className="absolute inset-x-0 top-0 bg-gradient-to-b from-black/70 via-black/40 to-transparent p-4 pt-5"
                    >
                      <motion.h3
                        variants={nameVariants as unknown as Variants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="text-lg font-bold tracking-tight text-white drop-shadow-sm sm:text-xl"
                      >
                        {name}
                      </motion.h3>
                    </motion.div>
                  )}
                </AnimatePresence>
                {/* Animated shimmer effect on hover */}
                <AnimatePresence>
                  {isHovered && !isFlipped && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{
                        opacity: 0.21,
                        x: ['-60%', '120%'],
                        background:
                          'linear-gradient(120deg, transparent 60%, rgba(255,255,255,0.28) 90%, transparent 100%)',
                      }}
                      exit={{ opacity: 0 }}
                      transition={{
                        duration: 1.0,
                        repeat: 1,
                      }}
                      className="absolute inset-0 pointer-events-none"
                      style={{ zIndex: 2 }}
                    />
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Back: Details */}
            <div
              // Remove sm:p-6 so that padding is present on all devices
              className="absolute inset-0 flex flex-col justify-between rounded-2xl bg-gradient-to-br from-primary/10 via-primary/50 to-primary/90 p-5"
              style={{
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
              }}
            >
              <div className="flex items-start justify-between gap-2">
                <motion.h3
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.18, duration: 0.29 }}
                  className="text-base font-bold tracking-tight text-primary sm:text-lg"
                >
                  {name}
                </motion.h3>
                <motion.div
                  initial={{ scale: 0.83, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    delay: 0.29,
                    type: 'spring',
                    stiffness: 350,
                    damping: 17,
                  }}
                  className="rounded-lg bg-primary/20 p-2 ring-1 ring-primary/30"
                  whileHover={{
                    rotate: 21,
                    scale: 1.13,
                    transition: { type: 'spring', stiffness: 240 },
                  }}
                >
                  <ArrowUpRight
                    className="size-4 text-primary sm:size-5"
                    strokeWidth={2}
                  />
                </motion.div>
              </div>
              <motion.div
                initial={{ scale: 0.93, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ delay: 0.21, duration: 0.33 }}
                className="h-48 w-48 rounded-full mx-auto mb-5"
              >
                <ProfilePicture picture={picture} name={name} isRounded />
              </motion.div>
              <div className="space-y-5 text-center">
                <AnimatePresence mode="wait">
                  {role && (
                    <motion.h6
                      key={role}
                      initial={{ opacity: 0, y: 24 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 24 }}
                      transition={{
                        duration: 0.31,
                        delay: 0.26,
                        type: 'spring',
                        stiffness: 290,
                        damping: 18,
                      }}
                      className="text-lg uppercase font-medium text-white"
                    >
                      {role}
                    </motion.h6>
                  )}
                </AnimatePresence>
                <div className="flex flex-wrap gap-2 justify-center items-center">
                  <AnimatePresence>
                    <motion.div
                      variants={badgeVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      className="flex flex-wrap items-center gap-3 text-lg text-slate-600"
                    >
                      <Badge color="info" variant="solid">
                        {company ?? 'MentorBridge'}
                      </Badge>
                    </motion.div>
                  </AnimatePresence>
                  {batch && (
                    <motion.div
                      variants={badgeVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      transition={{ delay: 0.12 }}
                      className=""
                    >
                      <Badge color="success" variant="solid">
                        {batch}
                      </Badge>
                    </motion.div>
                  )}
                </div>
                {socialLinks &&
                  (socialLinks.linkedIn ||
                    socialLinks.gitHub ||
                    socialLinks.website) && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 20 }}
                      transition={{
                        delay: 0.33,
                        type: 'spring',
                        stiffness: 250,
                        damping: 18,
                      }}
                      className="flex items-center gap-1 justify-center items-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <SocialLinks socialLinks={socialLinks} />
                    </motion.div>
                  )}
              </div>
            </div>
          </motion.div>
        </div>
      </Link>
    </motion.article>
  )
}
