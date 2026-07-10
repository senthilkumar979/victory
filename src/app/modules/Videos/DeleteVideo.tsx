'use client'

import { gooeyToast } from 'goey-toast'

import { Button } from '@/atoms/button/Button'
import type { SessionVideo } from '@/types/sessionVideo.types'

interface DeleteVideoProps {
  show: boolean
  video: SessionVideo | null
  onClose: () => void
  onDeleted: () => void
}

export const DeleteVideo = ({ show, video, onClose, onDeleted }: DeleteVideoProps) => {
  if (!show || !video) return null

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/session-videos/${video.id}`, { method: 'DELETE' })
      const body = await res.json()
      if (!res.ok) throw new Error(body.error ?? 'Delete failed')
      gooeyToast.success('Video deleted.')
      onDeleted()
    } catch (err) {
      gooeyToast.error('Failed to delete video.', {
        description: err instanceof Error ? err.message : undefined,
      })
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/80 p-4">
      <div className="w-full max-w-md rounded-lg border border-slate-700 bg-slate-900 p-5">
        <h3 className="text-lg font-semibold text-slate-100">Delete video?</h3>
        <p className="mt-2 text-sm text-slate-400">
          This will permanently delete &quot;{video.title}&quot;.
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="error" size="sm" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </div>
    </div>
  )
}
