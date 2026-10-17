import { describe, expect, it } from 'vitest'

import { joinClassNames } from './tailwindUtils'

describe('joinClassNames', () => {
  it('keeps every truthy class and does not merge Tailwind conflicts', () => {
    expect(joinClassNames('px-2', false, null, undefined, 'px-4')).toBe(
      'px-2 px-4',
    )
  })
})
