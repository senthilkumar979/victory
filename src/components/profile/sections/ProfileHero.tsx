'use client'

import { Download, Github, Globe, Linkedin, Mail } from 'lucide-react'
import { motion } from 'framer-motion'

import type { ProfileData } from '@/types/student.types'

interface ProfileHeroProps {
  student: ProfileData
}

export const ProfileHero = ({ student }: ProfileHeroProps) => {
  const { name, picture, role, company, batch, email, socialLinks, resumeLink } = student

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-lg"
    >
      <div className="flex flex-col gap-8 p-8 sm:flex-row sm:items-center sm:gap-12 lg:p-12">
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="shrink-0"
        >
          {picture ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={picture}
              alt={name}
              width={192}
              height={192}
              className="size-40 rounded-full object-cover ring-4 ring-primary/20 sm:size-48"
            />
          ) : (
            <div className="flex size-40 items-center justify-center rounded-full bg-primary/10 text-4xl font-bold text-primary sm:size-48">
              {name?.charAt(0)?.toUpperCase() ?? '?'}
            </div>
          )}
        </motion.div>
        <div className="min-w-0 flex-1 space-y-4">
          <motion.h1
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl"
          >
            {name}
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35 }}
            className="flex flex-wrap gap-2 text-lg text-slate-600"
          >
            <span className="font-semibold text-primary">{role}</span>
            {company && (
              <>
                <span aria-hidden>·</span>
                <span>{company}</span>
              </>
            )}
          </motion.div>
          {batch && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="rounded-full bg-secondary/5 px-4 py-1.5 text-sm font-medium text-secondary w-fit"
            >
              Batch {batch}
            </motion.p>
          )}
          {email && (
            <motion.a
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45 }}
              href={`mailto:${email}`}
              className="inline-flex items-center gap-2 text-sm text-primary transition-colors hover:text-primary/80 hover:underline"
            >
              <Mail className="size-4" />
              {email}
            </motion.a>
          )}
          {socialLinks && (socialLinks.linkedIn || socialLinks.gitHub || socialLinks.website) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap items-center gap-2 pt-2"
            >
              {socialLinks.linkedIn && (
                <a
                  href={socialLinks.linkedIn}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="LinkedIn"
                  className="rounded-full p-2.5 text-slate-500 transition-colors hover:bg-primary/10 hover:text-primary"
                >
                  <Linkedin className="size-5" />
                </a>
              )}
              {socialLinks.gitHub && (
                <a
                  href={socialLinks.gitHub}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="GitHub"
                  className="rounded-full p-2.5 text-slate-500 transition-colors hover:bg-primary/10 hover:text-slate-900"
                >
                  <Github className="size-5" />
                </a>
              )}
              {socialLinks.website && (
                <a
                  href={socialLinks.website}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Website"
                  className="rounded-full p-2.5 text-slate-500 transition-colors hover:bg-primary/10 hover:text-primary"
                >
                  <Globe className="size-5" />
                </a>
              )}
            </motion.div>
          )}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55 }}
            className="flex flex-wrap gap-3 pt-4"
          >
            {resumeLink && (
              <a
                href={resumeLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow-md"
              >
                <Download className="size-4" />
                View Resume
              </a>
            )}
            {email && (
              <a
                href={`mailto:${email}`}
                className="inline-flex items-center gap-2 rounded-lg border border-primary/40 bg-primary/5 px-5 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
              >
                <Mail className="size-4" />
                Send Email
              </a>
            )}
          </motion.div>
        </div>
      </div>
    </motion.section>
  )
}
