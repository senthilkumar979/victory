'use client'

import { motion } from 'framer-motion'
import {
  BookOpen,
  CalendarIcon,
  Github,
  HomeIcon,
  Linkedin,
  Mail,
  MapIcon,
  Shield,
  Twitter,
  UserIcon,
  Youtube,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

const SOCIAL_LINKS = [
  { href: '#', icon: Linkedin, label: 'LinkedIn' },
  { href: '#', icon: Github, label: 'GitHub' },
  { href: '#', icon: Twitter, label: 'Twitter' },
  { href: '#', icon: Youtube, label: 'YouTube' },
  { href: '#', icon: Mail, label: 'Contact' },
] as const

const QUICK_LINKS = [
  { href: '/', label: 'Home', icon: HomeIcon },
  { href: '/blogs', label: 'Blogs', icon: BookOpen },
  { href: '/events', label: 'Events', icon: CalendarIcon },
  { href: '/roadmap', label: 'Roadmaps', icon: MapIcon },
  { href: '/secured/profile', label: 'Profile', icon: UserIcon },
  { href: '/secured/admin', label: 'Administration', icon: Shield },
] as const

const TRUSTED_PARTNERS = [
  'Supabase',
  'Vercel',
  'Clerk',
  'TanStack',
  'Tailwind',
  'Radix UI',
  'Framer',
  'Next.js',
  'PostHog',
  'Sentry',
]

export const Footer = () => (
  <footer className="relative overflow-hidden border-t border-white/5 bg-[#0b1120]">
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_100%,rgba(213,63,140,0.06),transparent)]" />
    <PartnersCarousel partners={TRUSTED_PARTNERS} />
    <div className="relative z-10 mx-auto max-w-7xl px-6 py-14 lg:py-20">
      <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.4 }}
          className=""
        >
          <Image
            src="https://91qunajyvl11yxyb.public.blob.vercel-storage.com/logo"
            alt="MentorBridge"
            width={120}
            height={120}
            className="w-auto h-30"
          />
          <p className="mb-6 max-w-sm text-sm leading-relaxed text-slate-400">
            Empowering the next generation of builders through mentorship,
            community, and hands-on learning.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="flex gap-3 flex-row"
        >
          {SOCIAL_LINKS.map(({ href, icon: Icon, label }) => (
            <a
              key={label}
              href={href}
              aria-label={label}
              className="flex size-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-400 transition-all hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
            >
              <Icon className="size-5" />
            </a>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <h4 className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-500">
            Stay in the loop
          </h4>
          <p className="mb-4 text-sm text-slate-400">
            Get updates on news, events, and community highlights.
          </p>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex flex-col gap-2 sm:flex-row"
          >
            <input
              type="email"
              placeholder="you@example.com"
              className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50"
            />
            <button
              type="submit"
              className="rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Subscribe
            </button>
          </form>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-8 md:flex-row"
      >
        <p className="text-sm text-slate-500">
          © {new Date().getFullYear()} MentorBridge. All rights reserved.
        </p>
        <div className="flex gap-6 text-sm">
          <Link
            href="/privacy-policy"
            className="text-slate-500 transition-colors hover:text-slate-300"
          >
            Privacy Policy
          </Link>
          <span className="text-slate-500 transition-colors hover:text-slate-300">
            |
          </span>
          <Link
            href="/terms-conditions"
            className="text-slate-500 transition-colors hover:text-slate-300"
          >
            Terms & Conditions
          </Link>
        </div>
      </motion.div>
    </div>
  </footer>
)

interface PartnersCarouselProps {
  partners: readonly string[]
}

const PartnersCarousel = ({ partners }: PartnersCarouselProps) => (
  <div className="border-b border-white/5 py-8">
    <p className="mb-6 text-center text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
      Trusted by industry leaders
    </p>
    <div className="relative overflow-hidden">
      <div className="absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-[#0b1120] to-transparent" />
      <div className="absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-[#0b1120] to-transparent" />
      <div className="flex animate-partners-scroll gap-16">
        {[...partners, ...partners].map((name, i) => (
          <div
            key={`${name}-${i}`}
            className="flex shrink-0 items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-6 py-3 backdrop-blur-sm"
          >
            <span className="text-sm font-semibold text-slate-300">{name}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
)
