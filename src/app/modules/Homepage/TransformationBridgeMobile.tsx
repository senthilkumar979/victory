'use client'

import { cn } from '@/lib/utils'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { CARDS } from './data'
import type { TransformationCardData } from './Hero.types'

const CARD_DURATION_MS = 4000
const STUDENT_PHASE_MS = 1800

interface MobileTransformationCardProps {
  data: TransformationCardData
  isProfessional: boolean
  showBridgeGlow: boolean
}

const MobileTransformationCard = ({
  data,
  isProfessional,
  showBridgeGlow,
}: MobileTransformationCardProps) => (
  <motion.div
    layout
    className={cn(
      'relative overflow-hidden rounded-2xl border backdrop-blur-md transition-colors duration-300',
      isProfessional
        ? 'border-success/60 bg-white/10 shadow-[0_0_20px_rgba(22,163,74,0.2)]'
        : 'border-white/20 bg-white/5',
    )}
    initial={false}
    animate={{
      scale: isProfessional ? 1.02 : 1,
      boxShadow: isProfessional
        ? '0 0 24px rgba(22,163,74,0.25), 0 0 48px rgba(6,182,212,0.1)'
        : '0 4px 24px rgba(0,0,0,0.2)',
    }}
    transition={{ duration: 0.4, ease: 'easeOut' }}
  >
    {showBridgeGlow && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="pointer-events-none absolute inset-0 z-10 rounded-2xl bg-gradient-to-r from-cyan-400/20 via-white/15 to-indigo-400/20"
        aria-hidden
      />
    )}
    <div className="relative p-4">
      <AnimatePresence mode="wait">
        {isProfessional ? (
          <motion.div
            key="professional"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="space-y-2"
          >
            <span className="inline-flex rounded-full bg-success/90 px-2.5 py-0.5 text-xs font-semibold text-white">
              Hired
            </span>
            <h4 className="font-semibold text-white">{data.name}</h4>
            <p className="border-l-2 border-success/40 pl-2 text-sm text-cyan-300">
              {data.professionalRole}
            </p>
            <div className="flex items-center gap-2">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-slate-700/50 text-xs font-bold text-white">
                {data.professionalCompany.slice(0, 2)}
              </div>
              <p className="truncate text-xs font-medium text-slate-300">
                {data.professionalCompany}
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="student"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="space-y-2"
          >
            <span className="inline-flex rounded-full bg-primary/20 px-2.5 py-0.5 text-xs font-semibold text-primary">
              Student
            </span>
            <h4 className="font-semibold text-white">{data.name}</h4>
            <p className="text-sm text-slate-400">{data.studentDept}</p>
            <p className="text-xs text-slate-500">{data.studentCollege}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  </motion.div>
)

export const TransformationBridgeMobile = () => {
  const [cardIndex, setCardIndex] = useState(0)
  const [isProfessional, setIsProfessional] = useState(false)
  const [showBridgeGlow, setShowBridgeGlow] = useState(false)

  const currentCard = CARDS[cardIndex]

  useEffect(() => {
    const studentTimer = setTimeout(() => {
      setShowBridgeGlow(true)
      setIsProfessional(true)
    }, STUDENT_PHASE_MS)

    const glowOffTimer = setTimeout(() => setShowBridgeGlow(false), STUDENT_PHASE_MS + 400)

    const nextCardTimer = setTimeout(() => {
      setCardIndex((i) => (i + 1) % CARDS.length)
      setIsProfessional(false)
    }, CARD_DURATION_MS)

    return () => {
      clearTimeout(studentTimer)
      clearTimeout(glowOffTimer)
      clearTimeout(nextCardTimer)
    }
  }, [cardIndex])

  return (
    <div className="relative w-full max-w-sm">
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center text-xl font-black uppercase tracking-widest text-primary/20 sm:text-2xl"
        aria-hidden
      >
        MentorBridge
      </div>

      <div className="relative z-10 flex flex-col items-center px-2 py-6">
        <div className="relative h-[200px] w-full min-w-[260px] max-w-[90vw]">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={cardIndex}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="absolute inset-x-0"
            >
              <MobileTransformationCard
                data={currentCard}
                isProfessional={isProfessional}
                showBridgeGlow={showBridgeGlow}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        <motion.div
          className="mt-4 flex gap-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {CARDS.map((_, i) => (
            <motion.button
              key={i}
              type="button"
              aria-label={`Go to card ${i + 1}`}
              className={cn(
                'h-1.5 rounded-full transition-colors',
                i === cardIndex ? 'w-6 bg-primary' : 'w-1.5 bg-white/30',
              )}
              onClick={() => {
                setCardIndex(i)
                setIsProfessional(false)
                setShowBridgeGlow(false)
              }}
              whileTap={{ scale: 0.9 }}
            />
          ))}
        </motion.div>
      </div>
    </div>
  )
}
