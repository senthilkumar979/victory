import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { AppContext } from '@/app/contexts/AppContext'

import { ProfileStats } from './ProfileStats'

vi.mock('framer-motion', () => ({
  motion: new Proxy(
    {},
    {
      get: () => 'div',
    },
  ),
}))

vi.mock('@/components/profile/AnimatedCounter', () => ({
  AnimatedCounter: function AnimatedCounter({ value }: { value: number }) {
    return <span>{value}</span>
  },
}))

afterEach(() => {
  cleanup()
})

function renderStats(
  context: {
    repositories?: unknown[] | null
    awards?: unknown[] | null
    blogs?: unknown[] | null
  },
  skillsCount: number,
) {
  render(
    <AppContext.Provider
      value={{
        repositories: context.repositories as never,
        awards: context.awards as never,
        blogs: context.blogs as never,
        dispatch: () => undefined,
      }}
    >
      <ProfileStats
        repositoriesCount={99}
        awardsCount={88}
        blogsCount={77}
        skillsCount={skillsCount}
      />
    </AppContext.Provider>,
  )
}

function statValue(label: string) {
  const labelNode = screen.getByText(label)
  return labelNode.parentElement?.querySelector('span')?.textContent
}

describe('ProfileStats', () => {
  it('counts context lists and skills, ignoring the other count props', () => {
    renderStats(
      {
        repositories: [{ id: 1 }, { id: 2 }],
        awards: [{ id: 'award' }],
        blogs: [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }],
      },
      3,
    )

    expect(statValue('Awards')).toBe('1')
    expect(statValue('Blogs')).toBe('4')
    expect(statValue('Skills')).toBe('3')
    expect(statValue('Repositories')).toBe('2')
    expect(screen.queryByText('99')).not.toBeInTheDocument()
    expect(screen.queryByText('88')).not.toBeInTheDocument()
    expect(screen.queryByText('77')).not.toBeInTheDocument()
  })

  it('treats missing context lists as zero', () => {
    renderStats(
      { repositories: null, awards: undefined, blogs: null },
      0,
    )

    expect(statValue('Awards')).toBe('0')
    expect(statValue('Blogs')).toBe('0')
    expect(statValue('Skills')).toBe('0')
    expect(statValue('Repositories')).toBe('0')
  })
})
