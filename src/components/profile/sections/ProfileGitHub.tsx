'use client'

import { Badge } from '@/atoms/badge/Badge'
import { GitHubRepository, useGetRepositories } from '@/hooks/useGetRepositores'
import { formatDateWithoutTime } from '@/utils/meetingUtils'
import { motion } from 'framer-motion'
import { Calendar, ExternalLink, Github, Star } from 'lucide-react'

interface ProfileGitHubProps {
  githubUrl?: string
}

export const ProfileGitHub = ({ githubUrl }: ProfileGitHubProps) => {
  const { repositories, isLoading, error } = useGetRepositories(githubUrl)

  if (isLoading) return <div>Loading repositories...</div>
  if (error) return <div>Error: {error}</div>

  return (
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
      <div className="space-y-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {repositories?.map((repo: GitHubRepository, idx: number) => (
          <motion.a
            key={repo.id}
            href={repo.htmlUrl}
            target="_blank"
            rel="noreferrer"
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.05 }}
            whileHover={{ x: 4, transition: { duration: 0.15 } }}
            className="group flex items-center gap-4 rounded-xl border border-slate-300 bg-secondary bg-gradient-to-br from-blue-500/20 via-cyan-500/10 to-transparent p-4 transition-all hover:border-primary/50 hover:bg-primary"
          >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white">
              <Github className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-white">{repo.name}</h3>
              {repo.description && (
                <p className="mt-0.5 line-clamp-1 text-xs text-white/80">
                  {repo.description}
                </p>
              )}
              <div className="mt-2 mb-2 flex flex-wrap gap-2">
                {Object.keys(repo.languages).map((language: string) => (
                  <Badge
                    color="primary"
                    variant="outline"
                    size="sm"
                    key={language}
                    className="group-hover:border-white group-hover:text-white"
                  >
                    {language}
                  </Badge>
                ))}
              </div>
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-white/80">
                {repo.stargazersCount != null && (
                  <span className="flex items-center gap-1">
                    <Star className="size-3.5" /> {repo.stargazersCount}
                  </span>
                )}
                {repo.updated_at && (
                  <span className="flex items-center gap-1">
                    <Calendar className="size-3.5" />{' '}
                    {formatDateWithoutTime(repo.updated_at)}
                  </span>
                )}
              </div>
            </div>
            <ExternalLink className="size-4 shrink-0 text-slate-400 opacity-0 transition-all group-hover:opacity-100 group-hover:text-primary" />
          </motion.a>
        ))}
        {repositories?.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center col-span-2">
            <Github className="size-12 text-slate-200" />
            <p className="mt-2 text-sm text-slate-500">No repositories found</p>
          </div>
        )}
      </div>
    </div>
  )
}
