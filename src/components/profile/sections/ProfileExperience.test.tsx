import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('framer-motion', () => {
  const MotionDiv = ({ children }: { children?: React.ReactNode }) => (
    <div>{children}</div>
  )
  return { motion: { div: MotionDiv } }
})

import { ProfileExperience } from './ProfileExperience'

const experience = {
  company: 'Codifi',
  role: 'Engineer',
  summary: 'Built APIs',
}

afterEach(() => {
  cleanup()
})

describe('ProfileExperience', () => {
  it('hides the website link when the experience has no site', () => {
    render(<ProfileExperience experience={[experience]} />)

    expect(screen.queryByRole('link', { name: /visit/i })).toBeNull()
  })

  it('opens the experience website in a new tab when one is set', () => {
    render(
      <ProfileExperience
        experience={[{ ...experience, website: 'https://codifi.example' }]}
      />,
    )

    const link = screen.getByRole('link', { name: /visit/i })
    expect(link).toHaveAttribute('href', 'https://codifi.example')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noreferrer')
  })
})
