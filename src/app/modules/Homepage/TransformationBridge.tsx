'use client'

import { cn } from '@/lib/utils'
import { animate, AnimatePresence, motion, useMotionValue, useTransform } from 'motion/react'
import { useEffect, useState } from 'react'
import { TransformationCardData } from './Hero.types'
import { CARDS } from './data'

const CYCLE_DURATION = 12
const TRACK_LENGTH = 720

interface TransformationCardProps {
  data: TransformationCardData
  index: number
  time: ReturnType<typeof useMotionValue<number>>
}

const TransformationCard = ({ data, index, time }: TransformationCardProps) => {
  const phase = (index * CYCLE_DURATION) / 3
  const progress = useTransform(time, (t) => {
    const cycle = (t + phase) % CYCLE_DURATION
    return cycle / CYCLE_DURATION
  })
  const x = useTransform(progress, (p) => (p - 0.5) * TRACK_LENGTH)
  const isProfessional = useTransform(progress, (p) => p > 0.5)
  const bridgeFlashOpacity = useTransform(progress, (p) => {
    const dist = Math.abs(p - 0.5)
    return dist < 0.08 ? 1 - dist / 0.08 : 0
  })
  const [showProfessional, setShowProfessional] = useState(false)

  useEffect(() => {
    const unsub = isProfessional.on('change', (v) => setShowProfessional(!!v))
    return () => unsub()
  }, [isProfessional])

  return (
    <motion.div
      style={{ x }}
      className="absolute left-1/2 top-1/2 w-[200px] shrink-0 -translate-x-1/2 -translate-y-1/2"
    >
      <motion.div
        layout
        className={cn(
          'relative overflow-hidden rounded-2xl border backdrop-blur-md transition-colors duration-300',
          showProfessional
            ? 'border-success/60 bg-white/10 shadow-[0_0_20px_rgba(22,163,74,0.2)]'
            : 'border-white/20 bg-white/5',
        )}
        initial={false}
        animate={{
          scale: showProfessional ? 1.02 : 1,
          boxShadow: showProfessional
            ? '0 0 24px rgba(22,163,74,0.25), 0 0 48px rgba(6,182,212,0.1)'
            : '0 4px 24px rgba(0,0,0,0.2)',
        }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <motion.div
          style={{ opacity: bridgeFlashOpacity }}
          className="pointer-events-none absolute inset-0 z-10 rounded-2xl bg-gradient-to-r from-cyan-400/30 via-white/20 to-indigo-400/30"
          aria-hidden
        />
        <div className="relative">
          <AnimatePresence mode="wait">
            {showProfessional ? (
              <motion.div
                key="professional"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="space-y-2 p-4 bg-primary"
              >
                <span className="inline-flex rounded-full bg-success px-2.5 py-0.5 text-xs font-semibold text-white">
                  Hired
                </span>
                <h4 className="font-semibold text-white">{data.name}</h4>
                <p className="text-sm text-white border-l-2 border-white pl-2">{data.professionalRole}</p>
                <div className="flex items-center gap-2">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-slate-700/50 text-xs font-bold text-white">
                    {data.professionalCompany.slice(0, 2)}
                  </div>
                  <p className="text-xs text-white font-bold">{data.professionalCompany}</p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="student"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="space-y-2 p-4"
              >
                <span className="inline-flex rounded-full bg-primary/20 px-2.5 py-0.5 text-xs font-semibold text-primary">
                  Student
                </span>
                <h4 className="font-semibold text-primary">{data.name}</h4>
                <p className="text-sm text-slate-400">{data.studentDept}</p>
                <p className="text-xs text-slate-500">{data.studentCollege}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  )
}

export const TransformationBridge = () => {
  const time = useMotionValue(0)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)')
    const handleChange = () => setIsMobile(mq.matches)
    handleChange()
    mq.addEventListener('change', handleChange)
    return () => mq.removeEventListener('change', handleChange)
  }, [])

  useEffect(() => {
    const controls = animate(time, CYCLE_DURATION, {
      duration: CYCLE_DURATION,
      repeat: Infinity,
      ease: 'linear',
    })
    return () => controls.stop()
  }, [time])

  if (isMobile) {
    return (
      <div className="flex w-full max-w-sm flex-col gap-3 py-4 sm:gap-4 sm:py-6">
        {CARDS.map((data, i) => (
          <motion.div
            key={data.name}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.12 }}
            className="rounded-xl border border-white/20 bg-white/5 p-3 backdrop-blur-md sm:rounded-2xl sm:p-4"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
              <div className="space-y-1">
                <span className="rounded-full bg-primary/20 px-2 py-0.5 text-xs font-semibold text-primary">
                  Student
                </span>
                <h4 className="font-semibold text-white">{data.name}</h4>
                <p className="text-sm text-slate-400">{data.studentDept}</p>
                <p className="text-xs text-slate-500">{data.studentCollege}</p>
              </div>
              <div className="border-t border-white/10 pt-3 sm:border-l sm:border-t-0 sm:pl-4 sm:pt-0">
                <span className="rounded-full bg-success/20 px-2 py-0.5 text-xs font-semibold text-success">
                  Hired
                </span>
                <p className="mt-1 text-sm text-cyan-300">{data.professionalRole}</p>
                <p className="text-xs text-slate-400">{data.professionalCompany}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    )
  }

  return (
    <div className="relative h-[280px] w-full max-w-md overflow-hidden sm:h-[320px]">
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center text-3xl font-black uppercase tracking-widest text-primary rotate-90"
        aria-hidden
      >
        MentorBridge
      </div>

      <div className="absolute left-1/2 top-0 bottom-0 w-1 -translate-x-4 overflow-hidden rounded-full">
        <div className="h-full w-full bg-gradient-to-b from-primary/20 via-primary/60 to-primary/80 opacity-90" />
        <motion.div
          animate={{
            boxShadow: [
              '0 0 20px rgba(6,182,212,0.4)',
              '0 0 40px rgba(99,102,241,0.5)',
              '0 0 20px rgba(6,182,212,0.4)',
            ],
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 bg-gradient-to-b from-primary/20 via-primary/60 to-primary/80"
        />
      </div>

      <div className="relative z-10 flex h-full items-center justify-center overflow-hidden">
        {CARDS.map((data, i) => (
          <TransformationCard key={data.name} data={data} index={i} time={time} />
        ))}
      </div>
    </div>
  )
}
