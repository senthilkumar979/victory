import { cleanup, render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { getInterviewTrack } from '@/data/interview-prep'

import InterviewPrepSlugPage, { generateMetadata } from './page'

const exerciseCounts = vi.hoisted(() => ({
  value: {} as Record<string, number>,
}))

vi.mock('next/navigation', () => ({
  notFound: () => {
    throw new Error('NEXT_NOT_FOUND')
  },
}))

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
  }: {
    href: string
    children: ReactNode
  }) => <a href={href}>{children}</a>,
}))

vi.mock('@/templates/PagaMain', () => ({
  PageMain: ({ children }: { children: ReactNode }) => <main>{children}</main>,
}))

vi.mock('@/data/interview-prep', async () => {
  const actual = await vi.importActual<typeof import('@/data/interview-prep')>(
    '@/data/interview-prep',
  )
  return {
    ...actual,
    getCodingExercisesForTrack: (slug: string) =>
      Array.from({ length: exerciseCounts.value[slug] ?? 0 }, (_, index) => ({
        id: `${slug}-${index}`,
      })),
  }
})

vi.mock('@/modules/InterviewPrep/InterviewPrepTrackShell', () => ({
  InterviewPrepTrackShell: ({
    trackSlug,
    trackTitle,
    codingExercises,
  }: {
    trackSlug: string
    trackTitle: string
    codingExercises: { id: string }[]
  }) => (
    <div>
      <p>shell:{trackSlug}</p>
      <p>shell-title:{trackTitle}</p>
      <p>shell-exercises:{codingExercises.length}</p>
    </div>
  ),
}))

describe('interview prep slug page', () => {
  beforeEach(() => {
    exerciseCounts.value = {}
  })

  afterEach(() => {
    cleanup()
  })

  it('rejects unknown slugs, including the java roadmap slug', async () => {
    await expect(
      InterviewPrepSlugPage({ params: Promise.resolve({ slug: 'java' }) }),
    ).rejects.toThrow('NEXT_NOT_FOUND')
    await expect(
      InterviewPrepSlugPage({ params: Promise.resolve({ slug: 'Core-Java' }) }),
    ).rejects.toThrow('NEXT_NOT_FOUND')
    await expect(
      InterviewPrepSlugPage({ params: Promise.resolve({ slug: '' }) }),
    ).rejects.toThrow('NEXT_NOT_FOUND')
  })

  it('falls back the document title when the track does not exist', async () => {
    await expect(
      generateMetadata({ params: Promise.resolve({ slug: 'java' }) }),
    ).resolves.toEqual({ title: 'Interview prep' })

    const known = await generateMetadata({
      params: Promise.resolve({ slug: 'core-java' }),
    })

    expect(known.title).toBe('Core Java — Interview prep')
    expect(known.description).toContain('JVM')
  })

  it('pluralizes the coding-exercise count and keeps the shell on the track', async () => {
    const track = getInterviewTrack('core-java')
    expect(track).toBeDefined()
    exerciseCounts.value = { 'core-java': 1 }

    render(
      await InterviewPrepSlugPage({
        params: Promise.resolve({ slug: 'core-java' }),
      }),
    )

    expect(screen.getByRole('heading', { name: 'Core Java' })).toBeInTheDocument()
    expect(
      screen.getByText(`${track?.questions.length} curated questions`),
    ).toBeInTheDocument()
    expect(screen.getByText('1 coding exercise')).toBeInTheDocument()
    expect(screen.queryByText(/coding exercises/)).not.toBeInTheDocument()
    expect(screen.getByText('shell:core-java')).toBeInTheDocument()
    expect(screen.getByText('shell-exercises:1')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /All interview topics/ })).toHaveAttribute(
      'href',
      '/interview-prep',
    )
    expect(screen.getByRole('link', { name: 'Interview Preparation' })).toHaveAttribute(
      'href',
      '/interview-prep',
    )

    cleanup()
    exerciseCounts.value = { 'core-java': 2 }
    render(
      await InterviewPrepSlugPage({
        params: Promise.resolve({ slug: 'core-java' }),
      }),
    )
    expect(screen.getByText('2 coding exercises')).toBeInTheDocument()
    expect(screen.getByText('shell-exercises:2')).toBeInTheDocument()

    cleanup()
    exerciseCounts.value = {}
    render(
      await InterviewPrepSlugPage({
        params: Promise.resolve({ slug: 'core-java' }),
      }),
    )
    expect(screen.getByText('Coding exercises (more topics soon)')).toBeInTheDocument()
    expect(screen.getByText('shell-exercises:0')).toBeInTheDocument()
  })
})
