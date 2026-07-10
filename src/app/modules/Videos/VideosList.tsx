'use client'

import { useMemo, useState } from 'react'
import { Plus, Pencil, Trash2, Star } from 'lucide-react'

import { Button } from '@/atoms/button/Button'
import { useSessionVideos } from '@/hooks/useSessionVideos'
import { getSessionVideoCategoryLabel } from '@/lib/sessionVideos/sessionVideoCategories'
import { formatViewCount } from '@/lib/sessionVideos/youtubeUtils'
import type { SessionVideo, SessionVideoFormState } from '@/types/sessionVideo.types'
import { DeleteVideo } from './DeleteVideo'
import { VideoFormDrawer } from './VideoFormDrawer'

interface VideosListProps {
  adminPanel?: boolean
}

export const VideosList = ({ adminPanel = false }: VideosListProps) => {
  const { videos, isAdmin, isLoading, error, refetch } = useSessionVideos()
  const showAdminActions = adminPanel || isAdmin
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [formState, setFormState] = useState<SessionVideoFormState | undefined>()
  const [toDelete, setToDelete] = useState<SessionVideo | null>(null)

  const sortedVideos = useMemo(
    () => [...videos].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [videos],
  )

  const openCreate = () => {
    setFormState(undefined)
    setIsFormOpen(true)
  }

  const openEdit = (video: SessionVideo) => {
    setFormState({
      id: video.id,
      title: video.title,
      youtubeUrl: video.youtubeUrl,
      category: video.category,
      isFeatured: video.isFeatured,
    })
    setIsFormOpen(true)
  }

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="border-l-3 border-primary pl-4">
          <h2 className="text-lg font-semibold text-slate-50">Videos</h2>
          <p className="mt-1 text-sm text-slate-500">
            Manage cohort session video links for members.
          </p>
        </div>
        {showAdminActions && (
          <Button variant="primary" size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4" /> Add video
          </Button>
        )}
      </div>

      {isLoading && <p className="text-slate-400">Loading videos…</p>}
      {error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-300">
          {error}
        </p>
      )}

      {!isLoading && !error && sortedVideos.length === 0 && (
        <p className="text-center text-slate-400">No videos yet.</p>
      )}

      <div className="space-y-2">
        {sortedVideos.map((video) => (
          <div
            key={video.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-800 bg-slate-950/60 px-4 py-3"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate font-medium text-slate-100">{video.title}</p>
                {video.isFeatured && (
                  <Star className="h-4 w-4 shrink-0 fill-amber-400 text-amber-400" />
                )}
              </div>
              <p className="mt-0.5 text-sm text-slate-400">
                {getSessionVideoCategoryLabel(video.category)} ·{' '}
                {formatViewCount(video.viewCount)}
              </p>
            </div>
            {showAdminActions && (
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={() => openEdit(video)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setToDelete(video)
                    setIsDeleteOpen(true)
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>

      <VideoFormDrawer
        isOpen={isFormOpen}
        videoToEdit={formState}
        onClose={() => setIsFormOpen(false)}
        onSuccess={() => {
          setIsFormOpen(false)
          refetch()
        }}
      />
      <DeleteVideo
        show={isDeleteOpen}
        video={toDelete}
        onClose={() => setIsDeleteOpen(false)}
        onDeleted={() => {
          setIsDeleteOpen(false)
          refetch()
        }}
      />
    </>
  )
}
