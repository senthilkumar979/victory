import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { FancyText } from './fancy-text'

describe('FancyText', () => {
  it('renders the animated name overlay without allowing wrapped characters', () => {
    const { container } = render(
      <FancyText className="student-name" fillClassName="student-name-fill">
        Ada Lovelace
      </FancyText>,
    )

    const overlay = container.querySelector('span.absolute.inset-0.flex')
    const animatedCharacters = overlay?.querySelectorAll(':scope > span')

    expect(overlay).toHaveClass('overflow-hidden', 'w-full')
    expect(overlay).not.toHaveClass('flex-wrap')
    expect(animatedCharacters).toHaveLength('Ada Lovelace'.length)
    expect(overlay).toHaveTextContent('Ada\u00A0Lovelace')
  })
})
