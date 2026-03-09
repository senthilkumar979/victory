import { motion } from 'framer-motion'
import { Linkedin, Twitter, Youtube } from 'lucide-react'

const SOCIAL_LINKS = [
  {
    href: 'https://www.linkedin.com/company/mentor-bridge-india/',
    icon: Linkedin,
    label: 'LinkedIn',
  },
  { href: 'https://x.com/mentorbridgein', icon: Twitter, label: 'Twitter' },
  {
    href: 'https://www.youtube.com/@mentor-bridge-india',
    icon: Youtube,
    label: 'YouTube',
  },
] as const

export const SocialLinks = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.4, delay: 0.05 }}
    >
      <div className="flex gap-3 flex-row">
        {SOCIAL_LINKS.map(({ href, icon: Icon, label }) => (
          <a
            key={label}
            href={href}
            aria-label={label}
            className="flex size-10 items-center justify-center rounded-xl border border-primary/40 bg-white/5 text-slate-400 transition-all hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
          >
            <Icon className="size-5" />
          </a>
        ))}
      </div>
    </motion.div>
  )
}
