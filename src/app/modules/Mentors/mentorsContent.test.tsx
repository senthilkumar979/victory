import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { renderHighlightedDescription } from './mentorsContent'

describe('renderHighlightedDescription', () => {
  it('returns the original string when there are no skills', () => {
    expect(renderHighlightedDescription('Plain text', [])).toBe('Plain text')
  })

  it('highlights skill names regardless of case', () => {
    const { container } = render(
      <>{renderHighlightedDescription('Learn react and REACT.', ['React'])}</>,
    )
    const hits = [...container.querySelectorAll('span')]

    expect(hits.map((hit) => hit.textContent)).toEqual(['react', 'REACT'])
    for (const hit of hits) {
      expect(hit.className).toContain('font-medium')
      expect(hit.className).toContain('text-[#d53f8c]')
    }
  })

  it('treats regex metacharacters in a skill as literal text', () => {
    const { container } = render(
      <>{renderHighlightedDescription('Use C+ daily', ['C+'])}</>,
    )
    const hits = [...container.querySelectorAll('span')]

    expect(hits).toHaveLength(1)
    expect(hits[0]?.textContent).toBe('C+')
    expect(container.textContent).toBe('Use C+ daily')
  })

  it('uses the first listed skill when names overlap', () => {
    const { container } = render(
      <>
        {renderHighlightedDescription('JavaScript', ['Java', 'JavaScript'])}
      </>,
    )

    expect(container.querySelector('span')?.textContent).toBe('Java')
    expect(container.textContent).toBe('JavaScript')
  })
})
