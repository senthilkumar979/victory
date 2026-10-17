import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { ProfileMentorBridge } from './ProfileMentorBridge'

const experience = {
  company: 'MentorBridge',
  role: 'Mentor',
  summary: 'Taught students',
}

afterEach(() => {
  cleanup()
})

describe('ProfileMentorBridge', () => {
  it('omits the website anchor when website is missing', () => {
    render(<ProfileMentorBridge exp={experience} />)

    expect(screen.queryByRole('link')).toBeNull()
    expect(screen.getByText('MentorBridge')).toBeTruthy()
  })

  it('links the website in a new tab when one is set', () => {
    render(
      <ProfileMentorBridge
        exp={{ ...experience, website: 'https://mentorbridge.in' }}
      />,
    )

    const link = screen.getByRole('link', { name: 'https://mentorbridge.in' })
    expect(link).toHaveAttribute('href', 'https://mentorbridge.in')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noreferrer')
  })
})
