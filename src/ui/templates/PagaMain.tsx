import { motion } from 'framer-motion'

export const PageMain = ({ children }: { children: React.ReactNode }) => {
  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="relative min-h-screen"
    >
      {/* Ambient background */}
      <div className="profile-hero-mesh pointer-events-none absolute inset-0" />
      <div className="absolute -left-1/4 top-1/4 h-96 w-96 rounded-full bg-primary/10 blur-[120px]" />
      <div className="absolute -right-1/4 bottom-1/4 h-96 w-96 rounded-full bg-info/10 blur-[120px]" />
      {children}
    </motion.main>
  )
}
