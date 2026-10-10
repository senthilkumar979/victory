import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { StudentRole } from './StudentRole'

afterEach(() => {
  cleanup()
})

function roleClass(role: string) {
  render(<StudentRole role={role} />)
  return screen.getByText(role).className
}

describe('StudentRole', () => {
  it('maps known roles to their color tokens', () => {
    expect(roleClass('Mobile App Developer')).toContain('text-tertiary')
    cleanup()
    expect(roleClass('Frontend Engineer')).toContain('text-primary')
    cleanup()
    expect(roleClass('Backend Engineer')).toContain('text-secondary')
    cleanup()
    expect(roleClass('UX Designer')).toContain('text-success')
    cleanup()
    expect(roleClass('FullStack Engineer')).toContain('text-info')
    cleanup()
    expect(roleClass('Python Developer')).toContain('text-error')
  })

  it('uses the warning token when the role is unknown or cased differently', () => {
    expect(roleClass('Data Engineer')).toContain('text-warning')
    cleanup()
    expect(roleClass('frontend engineer')).toContain('text-warning')
  })
})
