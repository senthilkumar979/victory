'use client'

import { DownloadIcon } from 'lucide-react'

import { Button } from '@/atoms/button/Button'

import { downloadGeneratedImage } from './nanoBananaDownload'

export interface NanoBananaPin {
  id: string
  prompt: string
  imageBase64: string
  mimeType: string
}

interface NanoBananaPinCardProps {
  pin: NanoBananaPin
}

export const NanoBananaPinCard = ({ pin }: NanoBananaPinCardProps) => (
  <article className="mb-4 break-inside-avoid transition-transform duration-300 hover:-translate-y-0.5">
    <div className="overflow-hidden rounded-2xl bg-white p-2 shadow-[0_12px_40px_-16px_rgba(0,0,0,0.2)] ring-1 ring-zinc-200/90">
      <div className="relative overflow-hidden rounded-xl bg-zinc-100">
        {/* eslint-disable-next-line @next/next/no-img-element -- data URL from API */}
        <img
          src={`data:${pin.mimeType};base64,${pin.imageBase64}`}
          alt=""
          className="aspect-square w-full object-cover"
        />
      </div>
      <p className="mt-2 line-clamp-3 px-1 text-xs leading-relaxed text-zinc-600">
        {pin.prompt}
      </p>
      <div className="mt-2 flex justify-end px-1 pb-1">
        <Button
          variant="secondary"
          size="sm"
          type="button"
          className="gap-1.5 rounded-lg"
          onClick={() =>
            downloadGeneratedImage(
              pin.imageBase64,
              pin.mimeType,
              pin.prompt.slice(0, 48),
            )
          }
        >
          <DownloadIcon className="size-3.5" />
          Download
        </Button>
      </div>
    </div>
  </article>
)

export const NanoBananaLoadingPin = () => (
  <div className="mb-4 break-inside-avoid">
    <div className="overflow-hidden rounded-2xl bg-white p-2 shadow-xl ring-1 ring-zinc-200/80">
      <div className="nano-banana-shimmer aspect-square w-full rounded-xl" />
      <div className="mt-3 space-y-2 px-1 pb-2">
        <div className="h-3 w-3/4 animate-pulse rounded bg-zinc-200" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-zinc-200/80" />
      </div>
    </div>
  </div>
)
