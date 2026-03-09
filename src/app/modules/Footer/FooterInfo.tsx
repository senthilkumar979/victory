import { motion } from 'framer-motion'
import { ShieldCheckIcon, Signature } from 'lucide-react'
import Link from 'next/link'
import { SocialLinks } from './SocialLinks'

export const FooterInfo = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-8 md:flex-row"
    >
      <p className="text-sm text-black">
        © {new Date().getFullYear()} MentorBridge. All rights reserved.
      </p>
      <SocialLinks />
      <div className="flex gap-6 text-sm">
        <Link
          href="/privacy-policy"
          className="text-black transition-colors hover:text-black-600 flex items-center gap-2"
        >
          <ShieldCheckIcon className="size-4" />
          <span>Privacy Policy</span>
        </Link>
        <span className="text-black transition-colors hover:text-black-600">
          |
        </span>
        <Link
          href="/terms-conditions"
          className="text-black transition-colors hover:text-black-600 flex items-center gap-2"
        >
          <Signature className="size-4" />
          Terms & Conditions
        </Link>
      </div>
    </motion.div>
  )
}
