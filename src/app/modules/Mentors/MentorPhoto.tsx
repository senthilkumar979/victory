'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

import { cn } from '@/lib/utils'

import { accent, layoutTransition, type MentorKey } from './Mentors'
import { type Mentor, mentors } from './mentorsContent'

interface MentorPhotoProps {
  mentorKey: MentorKey
  size: 'active' | 'inactive'
}

const blobA = '63% 37% 54% 46% / 55% 48% 52% 48%'
const blobB = '38% 62% 55% 45% / 62% 38% 48% 52%'

export function MentorPhoto({ mentorKey, size }: MentorPhotoProps) {
  const m: Mentor = mentors.find((mentor) => mentor.id === mentorKey)!
  const isActive = size === 'active'

  return (
    <motion.div
      layoutId={`mentor-photo-${mentorKey}`}
      layout
      transition={layoutTransition}
      className={cn(
        'relative shrink-0',
        isActive ? 'w-full max-w-[420px]' : 'size-28',
      )}
    >
      {isActive && (
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[125%] w-[118%] -translate-x-1/2 -translate-y-1/2"
          aria-hidden
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-[#d53f8c]/55 via-fuchsia-400/40 to-pink-200/45"
            style={{ borderRadius: blobA }}
            animate={{ rotate: [0, 3, -2, 0] }}
            transition={{
              duration: 14,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <div
            className="absolute inset-0 scale-[1.08] bg-gradient-to-tl from-[#fbcfe8]/50 via-transparent to-[#a855f7]/25"
            style={{ borderRadius: blobB }}
          />
          <div
            className="absolute -inset-2 blur-2xl"
            style={{
              borderRadius: blobA,
              background: `radial-gradient(ellipse at 40% 35%, ${accent}50, transparent 62%)`,
            }}
          />
        </div>
      )}

      <div
        className={cn(
          'relative overflow-hidden bg-gradient-to-b from-gray-100 to-gray-200/90',
          isActive && 'rounded-2xl shadow-[0_22px_55px_-14px_rgba(0,0,0,0.28)]',
          !isActive && 'rounded-xl shadow-[0_10px_28px_-12px_rgba(213,63,140,0.35)]',
        )}
      >
        <div
          className={cn(
            'relative w-full',
            isActive ? 'aspect-[4/5]' : 'aspect-square h-full',
          )}
        >
          <Image
            src={m.image}
            alt={`Portrait of ${m.name}`}
            fill
            className="object-cover object-center"
            sizes={isActive ? '(max-width: 768px) 100vw, 420px' : '112px'}
            priority={isActive}
          />
          {isActive && (
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/[0.14] via-transparent to-white/[0.08]"
              aria-hidden
            />
          )}
          {!isActive && (
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent"
              aria-hidden
            />
          )}
        </div>
      </div>
    </motion.div>
  )
}
