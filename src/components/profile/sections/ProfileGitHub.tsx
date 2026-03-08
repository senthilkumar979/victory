'use client'

import { ExternalLink, Github, Star } from 'lucide-react'
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
    description: 'Full-stack app with Next.js & Supabase',
    url: 'https://github.com',
    stars: 42,
    language: 'TypeScript',
  },
  {
    name: 'portfolio',
    description: 'Personal portfolio & projects',
    url: 'https://github.com',
    stars: 28,
    language: 'React',
  },
  {
    name: 'mentor-bridge-contrib',
    description: 'Contributions to MentorBridge',
    url: 'https://github.com',
    stars: 15,
    language: 'TypeScript',
  },
]

interface ProfileGitHubProps {
  githubUrl?: string
}

export const ProfileGitHub = ({ githubUrl }: ProfileGitHubProps) => (
  <div>
    <div className="mb-6 flex items-center justify-between">
      <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-primary">
        <Github className="size-4" />
        GitHub
      </h2>
      {githubUrl && (
        <motion.a
          href={githubUrl}
          target="_blank"
          rel="noreferrer"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
        >
          View Profile
          <ExternalLink className="size-3.5" />
        </motion.a>
      )}
    </div>
    <div className="space-y-3">
      {DUMMY_REPOS.map((repo, idx) => (
        <motion.a
          key={repo.name}
          href={repo.url}
          target="_blank"
          rel="noreferrer"
          initial={{ opacity: 0, x: -10 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: idx * 0.05 }}
          whileHover={{ x: 4, transition: { duration: 0.15 } }}
          className="group flex items-center gap-4 rounded-xl border border-slate-100 bg-slate-50/50 p-4 transition-all hover:border-primary/20 hover:bg-primary/5"
        >
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-white">
            <Github className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-slate-900">{repo.name}</h3>
            {repo.description && (
              <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">
                {repo.description}
              </p>
            )}
            <div className="mt-2 flex gap-4 text-xs text-slate-500">
              {repo.language && <span>{repo.language}</span>}
              {repo.stars != null && (
                <span className="flex items-center gap-1">
                  <Star className="size-3.5" /> {repo.stars}
                </span>
              )}
            </div>
          </div>
          <ExternalLink className="size-4 shrink-0 text-slate-400 opacity-0 transition-all group-hover:opacity-100 group-hover:text-primary" />
        </motion.a>
      ))}
    </div>
  </div>
)
