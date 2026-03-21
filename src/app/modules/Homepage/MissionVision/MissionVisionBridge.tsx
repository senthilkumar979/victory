'use client'

import { motion } from 'framer-motion'

interface MissionVisionBridgeProps {
  from: string
  to: string
  reduceMotion: boolean
}

export const MissionVisionBridge = ({
  from,
  to,
  reduceMotion,
}: MissionVisionBridgeProps) => (
  <div className="flex flex-col items-stretch justify-center" aria-hidden>
    <div className="flex items-center gap-3 lg:hidden">
      <span className="shrink-0 font-mono text-[10px] font-medium uppercase tracking-[0.25em] text-slate-400">
        {from}
      </span>
      <div className="relative h-px flex-1 overflow-hidden rounded-full bg-slate-200/90">
        {!reduceMotion && (
          <motion.div
            className="absolute inset-y-0 left-0 w-[28%] rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-fuchsia-500 shadow-[0_0_12px_rgba(205, 71, 215, 0.45)]"
            animate={{ x: ['-100%', '420%'] }}
            transition={{ duration: 3.8, repeat: Infinity, ease: 'linear' }}
          />
        )}
      </div>
      <span className="shrink-0 font-mono text-[10px] font-medium uppercase tracking-[0.25em] text-slate-400">
        {to}
      </span>
    </div>

    <div className="hidden min-h-[min(100%,260px)] w-full flex-col items-center justify-center gap-4 lg:flex lg:w-20 xl:w-24">
      <span className="font-mono text-[10px] font-medium uppercase tracking-[0.25em] text-slate-400">
        {from}
      </span>
      <div className="relative min-h-[180px] w-px flex-1 overflow-hidden rounded-full bg-slate-200/90">
        {!reduceMotion && (
          <motion.div
            className="absolute left-0 right-0 top-0 h-[32%] rounded-full bg-gradient-to-b from-pink-500 via-purple-500 to-fuchsia-500 shadow-[0_0_18px_rgba(227, 114, 239, 0.45)]"
            animate={{ y: ['-120%', '320%'] }}
            transition={{ duration: 3.8, repeat: Infinity, ease: 'linear' }}
          />
        )}
      </div>
      <span className="font-mono text-[10px] font-medium uppercase tracking-[0.25em] text-slate-400">
        {to}
      </span>
    </div>
  </div>
)
