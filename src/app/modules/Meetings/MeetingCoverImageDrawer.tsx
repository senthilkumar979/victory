'use client'

import { ImageIcon, Loader2Icon } from 'lucide-react'

import { Drawer } from '@/ui/organisms/drawer/Drawer'
import { Button } from '@/atoms/button/Button'

import type { MeetingFormState } from './Meeting.types'
import { useMeetingCoverImage } from './useMeetingCoverImage'

interface MeetingCoverImageDrawerProps {
  meeting: MeetingFormState | null
  isOpen: boolean
  onClose: () => void
  onConfirmed: () => void
}

export const MeetingCoverImageDrawer = ({
  meeting,
  isOpen,
  onClose,
  onConfirmed,
}: MeetingCoverImageDrawerProps) => {
  const {
    prompt,
    setPrompt,
    previewUrl,
    previewPathname,
    isGenerating,
    isConfirming,
    generate,
    confirm,
  } = useMeetingCoverImage(meeting, isOpen)

  const handleConfirm = async () => {
    const result = await confirm()
    if (result?.ok) {
      onConfirmed()
      onClose()
    }
  }

  if (!meeting?.id) return null

  return (
    <Drawer isOpen={isOpen} onClose={onClose} size="xl">
      <Drawer.Title description="Gemini 2.5 Flash Image (Nano Banana): 16:9 cover from meeting details and the MentorBridge logo. Google Imagen is a separate image API; this screen uses Gemini native image output only. Edit the prompt, regenerate, then confirm.">
        Generate meeting cover
      </Drawer.Title>
      <Drawer.Body>
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            <span className="font-medium text-slate-800">{meeting.title}</span>
          </p>
          <label
            className="block text-sm font-medium text-slate-700"
            htmlFor="cover-prompt"
          >
            Image prompt (editable)
          </label>
          <textarea
            id="cover-prompt"
            className="min-h-[140px] w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isGenerating || isConfirming}
          />
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              size="sm"
              type="button"
              disabled={isGenerating || isConfirming}
              onClick={() => void generate()}
            >
              {isGenerating ? (
                <Loader2Icon className="size-4 animate-spin" />
              ) : (
                <ImageIcon className="size-4" />
              )}
              {previewUrl ? 'Regenerate' : 'Generate'}
            </Button>
          </div>
          {previewUrl ? (
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
              {/* eslint-disable-next-line @next/next/no-img-element -- dynamic blob preview URL */}
              <img
                src={previewUrl}
                alt="Generated cover preview"
                className="aspect-video w-full object-cover"
              />
            </div>
          ) : (
            <p className="text-sm text-slate-500">
              Generate a preview to review before saving to the meeting.
            </p>
          )}
        </div>
      </Drawer.Body>
      <Drawer.Footer>
        <Button variant="secondary" size="sm" type="button" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="primary"
          size="sm"
          type="button"
          disabled={!previewPathname || isConfirming || isGenerating}
          onClick={() => void handleConfirm()}
        >
          {isConfirming ? (
            <Loader2Icon className="size-4 animate-spin" />
          ) : null}
          Use as cover image
        </Button>
      </Drawer.Footer>
    </Drawer>
  )
}
