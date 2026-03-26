'use client'

import { useCallback, useState } from 'react'

import { gooeyToast } from 'goey-toast'
import { SparklesIcon } from 'lucide-react'

import {
  NanoBananaLoadingPin,
  NanoBananaPinCard,
  type NanoBananaPin,
} from './NanoBananaPinCard'
import { NanoBananaSearchBar } from './NanoBananaSearchBar'

export const NanoBananaPlayground = () => {
  const [prompt, setPrompt] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [cards, setCards] = useState<NanoBananaPin[]>([])

  const runGenerate = useCallback(async () => {
    const text = prompt.trim()
    if (!text || isLoading) return
    setIsLoading(true)
    try {
      const res = await fetch('/api/nano-banana/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: text }),
      })
      const data = (await res.json().catch(() => ({}))) as {
        error?: string
        code?: string
        imageBase64?: string
        mimeType?: string
      }
      if (!res.ok) {
        const msg = data.error ?? 'Image generation failed'
        if (res.status === 429 || data.code === 'quota') {
          gooeyToast.error('Rate limit or quota', {
            description: msg,
            bounce: 0.45,
            borderColor: '#E0E0E0',
            borderWidth: 2,
            timing: { displayDuration: 5000 },
          })
        } else if (res.status === 422 || data.code === 'safety') {
          gooeyToast.error('Safety filter', {
            description: msg,
            bounce: 0.45,
            borderColor: '#E0E0E0',
            borderWidth: 2,
            timing: { displayDuration: 4500 },
          })
        } else {
          gooeyToast.error('Generation failed', {
            description: msg,
            bounce: 0.45,
            borderColor: '#E0E0E0',
            borderWidth: 2,
            timing: { displayDuration: 4000 },
          })
        }
        return
      }
      if (!data.imageBase64 || !data.mimeType) {
        gooeyToast.error('Invalid response from server')
        return
      }
      setCards((prev) => [
        {
          id: crypto.randomUUID(),
          prompt: text,
          imageBase64: data.imageBase64!,
          mimeType: data.mimeType!,
        },
        ...prev,
      ])
    } catch {
      gooeyToast.error('Network error', {
        description: 'Could not reach the server.',
        bounce: 0.45,
        borderColor: '#E0E0E0',
        borderWidth: 2,
        timing: { displayDuration: 3500 },
      })
    } finally {
      setIsLoading(false)
    }
  }, [prompt, isLoading])

  return (
    <div className="min-h-[70vh] bg-gradient-to-b from-stone-100 via-stone-50 to-zinc-100 px-3 py-8 text-zinc-900 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 text-center">
          <p className="mb-1 inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-medium uppercase tracking-wide text-zinc-500 shadow-sm ring-1 ring-zinc-200/80">
            <SparklesIcon className="size-3.5 text-amber-500" />
            Gemini 3.1 Flash Image · Nano Banana 2
          </p>
          <h1 className="mt-3 font-urbanist text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
            Imagine in a flash
          </h1>
          <p className="mt-2 text-sm text-zinc-600 sm:text-base">
            1:1 images, 1K — search-style prompt below, then collect pins.
          </p>
        </div>

        <NanoBananaSearchBar
          prompt={prompt}
          isLoading={isLoading}
          onPromptChange={setPrompt}
          onSubmit={() => void runGenerate()}
        />

        <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
          {isLoading ? <NanoBananaLoadingPin /> : null}
          {cards.map((c) => (
            <NanoBananaPinCard key={c.id} pin={c} />
          ))}
        </div>

        {!isLoading && cards.length === 0 ? (
          <p className="py-12 text-center text-sm text-zinc-500">
            Your generated images will appear here as Pinterest-style cards.
          </p>
        ) : null}
      </div>
    </div>
  )
}
