'use client'

import { ExternalLink, Github } from 'lucide-react'
import { motion } from 'framer-motion'

interface RepoItem {
  name: string
  description?: string
  url: string
  stars?: number
  language?: string
}

const DUMMY_REPOS: RepoItem[] = [
  {
    name: 'sample-project',
    description: 'A full-stack application built with Next.js and Supabase',
    url: 'https://github.com',
    stars: 42,
    language: 'TypeScript',
  },
  {
    name: 'portfolio',
    description: 'Personal portfolio showcasing projects and experience',
    url: 'https://github.com',
    stars: 28,
    language: 'React',
  },
  {
    name: 'mentor-bridge-contrib',
    description: 'Contributions to the MentorBridge platform',
    url: 'https://github.com',
    stars: 15,
    language: 'TypeScript',
  },
]

interface ProfileGitHubProps {
  githubUrl?: string
}

export const ProfileGitHub = ({ githubUrl }: ProfileGitHubProps) => (
  <motion.section
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-50px' }}
    transition={{ duration: 0.4 }}
    className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-md lg:p-8"
  >
    <div className="mb-6 flex items-center justify-between">
      <h2 className="text-xl font-semibold text-slate-900">GitHub</h2>
      {githubUrl && (
        <a
          href={githubUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
        >
          <Github className="size-4" />
          View Profile
          <ExternalLink className="size-3" />
        </a>
      )}
    </div>
    <div className="space-y-4">
      {DUMMY_REPOS.map((repo, idx) => (
        <motion.a
          key={repo.name}
          href={repo.url}
          target="_blank"
          rel="noreferrer"
          initial={{ opacity: 0, x: -10 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: idx * 0.06 }}
          whileHover={{ x: 4 }}
          className="group flex items-start gap-4 rounded-xl border border-slate-100 p-4 transition-colors hover:border-primary/20 hover:bg-slate-50/80"
        >
          <div className="shrink-0 rounded-lg bg-slate-100 p-2">
            <Github className="size-5 text-slate-600" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-slate-900 transition-colors group-hover:text-primary">
              {repo.name}
            </h3>
            {repo.description && (
              <p className="mt-1 text-sm text-slate-600 line-clamp-1">
                {repo.description}
              </p>
            )}
            <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500">
              {repo.language && <span>{repo.language}</span>}
              {repo.stars != null && <span>★ {repo.stars}</span>}
            </div>
          </div>
          <ExternalLink className="size-4 shrink-0 text-slate-400" />
        </motion.a>
      ))}
    </div>
  </motion.section>
)
