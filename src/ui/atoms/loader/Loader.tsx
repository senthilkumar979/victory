import { AnimatePresence, motion } from 'framer-motion'

export interface LoaderProps {
  isShow: boolean
}

export const Loader = ({ isShow }: LoaderProps) => (
  <AnimatePresence>
      {isShow ? (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/70 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        aria-live="polite"
        aria-busy="true"
        role="status"
      >
        <div className="relative flex flex-col items-center gap-6">
          {/* Multi-ring spinner with glow */}
          <div className="relative h-20 w-20">
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-primary/30"
              animate={{ rotate: 360 }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
            <motion.div
              className="absolute inset-1 rounded-full border-2 border-transparent border-t-primary border-r-primary/60"
              animate={{ rotate: -360 }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
            <motion.div
              className="absolute inset-3 rounded-full border-2 border-transparent border-b-primary border-l-primary/80"
              animate={{ rotate: 360 }}
              transition={{
                duration: 0.9,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              animate={{ scale: [1, 1.15, 1], opacity: [0.8, 1, 0.8] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <div className="h-3 w-3 rounded-full bg-primary shadow-[0_0_12px_var(--primary)]" />
            </motion.div>
          </div>

          {/* Pulsing dots */}
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="h-2 w-2 rounded-full bg-primary"
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </div>

          <span className="text-xs font-medium tracking-widest uppercase text-slate-400">
            Loading
          </span>
        </div>
      </motion.div>
      ) : null}
    </AnimatePresence>
  )
