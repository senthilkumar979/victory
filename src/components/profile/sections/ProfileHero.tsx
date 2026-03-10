'use client'

import { motion } from 'framer-motion'
import {
  Download,
  Github,
  Globe,
  GraduationCapIcon,
  Linkedin,
  Mail,
  Sparkles,
} from 'lucide-react'

import type { ProfileData } from '@/types/student.types'
import { Badge } from '../../../ui/atoms/badge/Badge'
import { FancyText } from '../../ui/fancy-text'

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
}

const item = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 100, damping: 20 },
  },
}

interface ProfileHeroProps {
  student: ProfileData
}

export const ProfileHero = ({ student }: ProfileHeroProps) => {
  const {
    name,
    picture,
    role,
    company,
    batch,
    email,
    socialLinks,
    resumeLink,
  } = student

  return (
    <motion.section
      initial="hidden"
      animate="visible"
      variants={container}
      className="relative overflow-hidden rounded-[2rem] border border-white/20 bg-gradient-to-br from-slate-50 via-white to-primary/5 profile-hero-mesh"
    >
      <div className="relative z-10 flex flex-col gap-10 p-8 sm:flex-row sm:items-center sm:gap-14 lg:p-14">
        <motion.div variants={item} className="relative shrink-0">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              type: 'spring',
              stiffness: 200,
              damping: 25,
              delay: 0.2,
            }}
            className="relative"
          >
            {picture ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={picture}
                alt={name}
                width={200}
                height={200}
                className="relative z-10 size-36 rounded-2xl object-cover shadow-2xl ring-4 ring-white/80 sm:size-44 lg:size-52"
              />
            ) : (
              <div className="relative z-10 flex size-36 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 text-5xl font-bold text-primary shadow-xl ring-4 ring-white/80 sm:size-44 letter-spacing-wide lg:size-52 uppercase">
                {name ?? '?'}
              </div>
            )}
            <div className="absolute -inset-4 -z-0 rounded-3xl bg-primary/10 blur-2xl" />
            <motion.div
              animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute -inset-2 -z-0 rounded-2xl bg-primary/20"
            />
          </motion.div>
        </motion.div>

        <div className="flex min-w-0 flex-1 flex-col gap-5">
          <div className="flex items-center gap-2">
            <motion.span
              variants={item}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary"
            >
              <Sparkles className="size-3.5" />
              MentorBridge
            </motion.span>
            {batch && (
              <motion.span
                variants={item}
                className="rounded-full bg-success px-3 py-1 text-xs font-medium text-white inline-flex items-center gap-1.5"
              >
                <GraduationCapIcon className="size-3.5" />
                Cohort {batch}
              </motion.span>
            )}
          </div>

          <FancyText
            className="text-5xl font-black leading-none text-black/10 dark:text-primary/10 letter-spacing-wide uppercase"
            fillClassName="text-primary dark:text-primary"
            stagger={0.06}
            duration={1.2}
            delay={0.2}
          >
            {name}
          </FancyText>

          <motion.div
            variants={item}
            className="flex flex-wrap items-center gap-3 text-lg text-slate-600"
          >
            <span className="font-semibold text-primary">{role}</span>
            <span className="text-slate-400">@</span>
            <Badge color="info" variant="outline">
              {company ?? 'MentorBridge'}
            </Badge>
          </motion.div>

          {email && (
            <motion.a
              variants={item}
              href={`mailto:${email}`}
              className="inline-flex w-fit items-center gap-2 text-sm text-slate-600 transition-colors hover:text-primary"
            >
              <Mail className="size-4" />
              {email}
            </motion.a>
          )}

          <motion.div
            variants={item}
            className="flex flex-wrap items-center gap-3 pt-2"
          >
            {socialLinks?.linkedIn && (
              <motion.a
                href={socialLinks.linkedIn}
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="rounded-xl p-2.5 text-slate-500 transition-colors hover:bg-primary/10 hover:text-primary"
              >
                <Linkedin className="size-6" />
              </motion.a>
            )}
            {socialLinks?.gitHub && (
              <motion.a
                href={socialLinks.gitHub}
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="rounded-xl p-2.5 text-slate-500 transition-colors hover:bg-primary/10 hover:text-slate-900"
              >
                <Github className="size-6" />
              </motion.a>
            )}
            {socialLinks?.website && (
              <motion.a
                href={socialLinks.website}
                target="_blank"
                rel="noreferrer"
                aria-label="Website"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="rounded-xl p-2.5 text-slate-500 transition-colors hover:bg-primary/10 hover:text-primary"
              >
                <Globe className="size-6" />
              </motion.a>
            )}
          </motion.div>

          <motion.div variants={item} className="flex flex-wrap gap-4 pt-4">
            {resumeLink && (
              <motion.a
                href={resumeLink}
                target="_blank"
                rel="noreferrer"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary/80 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-shadow hover:shadow-xl hover:shadow-primary/30"
              >
                <Download className="size-4" />
                View Resume
              </motion.a>
            )}
            {email && (
              <motion.a
                href={`mailto:${email}`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-2 rounded-xl border-2 border-slate-200 bg-white/80 px-6 py-3 text-sm font-semibold text-slate-700 backdrop-blur transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
              >
                <Mail className="size-4" />
                Contact
              </motion.a>
            )}
          </motion.div>
        </div>
      </div>
    </motion.section>
  )
}
