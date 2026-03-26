'use client'

import { Loader2Icon } from 'lucide-react'

import { Button } from '@/atoms/button/Button'

interface NanoBananaSearchBarProps {
  prompt: string
  isLoading: boolean
  onPromptChange: (value: string) => void
  onSubmit: () => void
}

export const NanoBananaSearchBar = ({
  prompt,
  isLoading,
  onPromptChange,
  onSubmit,
}: NanoBananaSearchBarProps) => (
  <div className="sticky top-0 z-10 mb-8 -mx-1 px-1 pb-2 pt-1">
    <div className="mx-auto flex max-w-2xl flex-col gap-0 overflow-hidden rounded-2xl bg-white shadow-[0_8px_40px_-12px_rgba(0,0,0,0.15)] ring-1 ring-zinc-200/90">
      <label className="sr-only" htmlFor="nano-prompt">
        Image prompt
      </label>
      <div className="flex items-stretch border-b border-zinc-100">
        <span className="flex items-center pl-4 text-zinc-400">
          <svg
            className="size-5"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
            />
          </svg>
        </span>
        <input
          id="nano-prompt"
          type="search"
          enterKeyHint="go"
          placeholder="Search a vibe—e.g. warm coffee shop on a rainy day, film grain…"
          className="min-w-0 flex-1 border-0 bg-transparent py-4 pl-2 pr-3 text-[15px] text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-0"
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onSubmit()
          }}
          disabled={isLoading}
        />
        <div className="flex items-center pr-2">
          <Button
            variant="primary"
            size="sm"
            type="button"
            className="min-h-10 shrink-0 rounded-xl px-5"
            disabled={isLoading || !prompt.trim()}
            onClick={onSubmit}
          >
            {isLoading ? (
              <Loader2Icon className="size-4 animate-spin" />
            ) : (
              'Generate'
            )}
          </Button>
        </div>
      </div>
    </div>
  </div>
)
