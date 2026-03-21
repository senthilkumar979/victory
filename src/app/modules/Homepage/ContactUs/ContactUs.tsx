'use client'

import { Button } from '@/components/ui/button'
import GlobeWireframe from '@/components/ui/globe-wireframe'
import { SeparatorPro } from '@/components/ui/seperatorpro'
import { cn } from '@/lib/utils'
import { ArrowRight, Mail, MessageCircle, Phone } from 'lucide-react'
import { motion } from 'motion/react'

const smoothEase = [0.25, 0.1, 0.25, 1] as const

const CONTACT_LINKS = [
  {
    icon: Mail,
    label: 'senthilkumar@mentorbridge.in',
    href: 'mailto:senthilkumar@mentorbridge.in',
  },
  { icon: MessageCircle, label: '+91 91760 08807', href: 'tel:+919176008807' },
  { icon: Phone, label: '+32 456 76 37 10', href: 'tel:+32456763710' },
]

interface ContactWithGlobeProps {
  title?: string
  subtitle?: string
  description?: string
  className?: string
}

export const ContactUs = ({
  title = 'Contact us',
  subtitle = 'Contact',
  description = 'Let us know how we can help you.',
  className,
}: ContactWithGlobeProps) => {
  return (
    <section
      className={cn(
        'relative w-full bg-primary/10 backdrop-blur-sm overflow-hidden py-20',
        className,
      )}
    >
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col items-center text-center gap-4 mb-12">
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: smoothEase }}
            className="inline-flex items-center px-4 py-1.5 rounded-full bg-primary/10 border border-primary/30"
          >
            <span className="text-sm text-primary font-medium flex  justify-center items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              {subtitle}
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: 0.15, ease: smoothEase }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary"
          >
            {title}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: 0.3, ease: smoothEase }}
            className="text-base text-slate-600 max-w-md"
          >
            {description}
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-5xl mx-auto items-center">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.0, delay: 0.2, ease: smoothEase }}
            className="flex flex-col gap-6"
          >
            <div className="flex flex-col gap-1">
              <h3 className="text-xl font-semibold text-slate-800">
                Get in touch
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed max-w-xs">
                Reach out via any channel below
              </p>
            </div>

            <div className="flex flex-col gap-3">
              {CONTACT_LINKS.map(({ icon: Icon, label, href }, i) => (
                <motion.a
                  key={label}
                  href={href}
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.5,
                    delay: 0.3 + i * 0.1,
                    ease: smoothEase,
                  }}
                  className="group flex items-center gap-3 w-fit text-sm text-primary hover:font-bold transition-colors duration-200"
                >
                  <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 group-hover:border-primary group-hover:bg-primary/10 flex items-center justify-center shrink-0 transition-all duration-200">
                    <Icon className="w-3.5 h-3.5 text-primary group-hover:text-primary transition-colors duration-200" />
                  </div>
                  {label}
                </motion.a>
              ))}
            </div>

            <div className="relative overflow-hidden h-128">
              <GlobeWireframe
                className="w-full aspect-square max-w-full absolute top-0 left-0"
                variant="wireframesolid"
                autoRotate
                autoRotateSpeed={0.45}
                strokeWidth={0.6}
                graticuleOpacity={0.12}
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.0, delay: 0.35, ease: smoothEase }}
            className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 sm:p-8 flex flex-col gap-5"
          >
            <div>
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-0.5">
                Send a message
              </h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Fill out the form and we&apos;ll get back to you promptly.
              </p>
            </div>

            <SeparatorPro variant="dots" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold tracking-widest uppercase text-zinc-400 dark:text-zinc-500">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Kumar"
                  className="w-full bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 outline-none focus:border-rose-400 dark:focus:border-rose-500/50 focus:ring-2 focus:ring-rose-500/10 transition-all duration-200"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold tracking-widest uppercase text-zinc-400 dark:text-zinc-500">
                  Company
                </label>
                <input
                  type="text"
                  placeholder="ABC Pvt Ltd"
                  className="w-full bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 outline-none focus:border-rose-400 dark:focus:border-rose-500/50 focus:ring-2 focus:ring-rose-500/10 transition-all duration-200"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold tracking-widest uppercase text-zinc-400 dark:text-zinc-500">
                Email Address
              </label>
              <input
                type="email"
                placeholder="kumar@abc.com"
                className="w-full bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 outline-none focus:border-rose-400 dark:focus:border-rose-500/50 focus:ring-2 focus:ring-rose-500/10 transition-all duration-200"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold tracking-widest uppercase text-zinc-400 dark:text-zinc-500">
                Message
              </label>
              <textarea
                placeholder="Type your message here"
                rows={8}
                className="w-full bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 outline-none focus:border-rose-400 dark:focus:border-rose-500/50 focus:ring-2 focus:ring-rose-500/10 resize-none transition-all duration-200"
              />
            </div>

            <Button className="w-fit h-11 px-8 rounded-xl font-semibold text-sm bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 group">
              Submit
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
