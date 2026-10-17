import { describe, expect, it } from 'vitest'

import { cn } from './utils'

describe('cn', () => {
  it('drops empty values and lets a later Tailwind class win', () => {
    expect(cn('px-2', false, null, undefined, 'px-4', 'text-sm')).toBe(
      'px-4 text-sm',
    )
  })
})
