import { motion } from 'framer-motion'
import Image from 'next/image'
export const FooterLogo = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center"
    >
      <Image
        src="https://91qunajyvl11yxyb.public.blob.vercel-storage.com/long-logo"
        alt="MentorBridge"
        width={500}
        height={100}
        className="w-auto h-25"
      />
      <p className="mb-6 mt-4 max-w-sm text-sm leading-relaxed text-black text-center">
        Empowering the next generation of builders through mentorship,
        community, and hands-on learning.
      </p>
    </motion.div>
  )
}
