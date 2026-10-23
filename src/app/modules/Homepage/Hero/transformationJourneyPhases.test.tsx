import { cleanup, render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { COMPANY_LOGOS } from '@/constants/CompanyConstants'

import { DesktopTransformationJourney } from './DesktopTransformationJourney'
import type { TransformationCardData } from './Hero.types'
import { MobileTransformationJourney } from './MobileTransformationJourney'

vi.mock('./useJourneyReducedMotion', () => ({
  useJourneyReducedMotion: () => false,
}))

vi.mock('next/image', () => ({
  default: function NextImage({
    alt,
    src,
    priority,
  }: {
    alt: string
    src?: string
    priority?: boolean
  }) {
    return (
      <span
        data-alt={alt}
        data-src={src ?? ''}
        data-priority={priority ? 'true' : 'false'}
      />
    )
  },
}))

vi.mock('motion/react', async () => {
  const { createElement } = await import('react')

  function motionTag(tag: string) {
    function MotionTag({
      children,
      className,
      ...props
    }: {
      children?: ReactNode
      className?: string
      'aria-hidden'?: boolean
    }) {
      return createElement(
        tag,
        { className, 'aria-hidden': props['aria-hidden'] },
        children,
      )
    }
    MotionTag.displayName = `Motion${tag}`
    return MotionTag
  }

  return {
    AnimatePresence: ({ children }: { children?: ReactNode }) => children,
    motion: { div: motionTag('div'), p: motionTag('p'), span: motionTag('span') },
  }
})

const codifiLogo = COMPANY_LOGOS.find((company) => company.name === 'Codifi')?.logo

function makeCard(company: string): TransformationCardData {
  return {
    name: 'Prasanna',
    studentDept: 'ECE Department',
    studentCollege: 'SSM College of Engineering & Technology',
    professionalRole: 'DevOps Engineer',
    professionalCompany: company,
    picture: 'https://example.com/prasanna.jpg',
  }
}

function isHidden(text: string): boolean {
  return Boolean(screen.getByText(text).closest('[aria-hidden="true"]'))
}

describe('transformation journey phases', () => {
  afterEach(() => {
    cleanup()
  })

  it('shows only the student on desktop until later phases', () => {
    const { rerender } = render(
      <DesktopTransformationJourney
        data={makeCard('Codifi')}
        phase={1}
        portraitPriority
      />,
    )

    expect(screen.getByText('Before MentorBridge')).toBeInTheDocument()
    expect(screen.queryByText('Training & mentorship')).not.toBeInTheDocument()
    expect(screen.queryByText('DevOps Engineer')).not.toBeInTheDocument()
    expect(document.querySelector('[data-alt="Prasanna"]')).toHaveAttribute(
      'data-priority',
      'true',
    )

    rerender(
      <DesktopTransformationJourney data={makeCard('Codifi')} phase={2} />,
    )
    expect(screen.getByText('Training & mentorship')).toBeInTheDocument()
    expect(screen.queryByText('After MentorBridge')).not.toBeInTheDocument()
  })

  it('keeps the mobile hired outcome hidden until phase 3', () => {
    const { rerender } = render(
      <MobileTransformationJourney
        data={makeCard('Codifi')}
        phase={1}
        portraitPriority
      />,
    )

    expect(screen.queryByText('Training & mentorship')).not.toBeInTheDocument()
    expect(isHidden('DevOps Engineer')).toBe(true)
    expect(document.querySelector('[data-alt="Prasanna"]')).toHaveAttribute(
      'data-priority',
      'true',
    )

    rerender(<MobileTransformationJourney data={makeCard('Codifi')} phase={2} />)
    expect(
      screen.getByText('Training & mentorship').closest('[aria-hidden="true"]'),
    ).toBeNull()
    expect(isHidden('DevOps Engineer')).toBe(true)
  })

  it.each([
    ['desktop', DesktopTransformationJourney],
    ['mobile', MobileTransformationJourney],
  ] as const)('reveals an exact company logo on phase 3 for %s', (_kind, Journey) => {
    render(<Journey data={makeCard('Codifi')} phase={3} />)
    expect(isHidden('DevOps Engineer')).toBe(false)
    expect(document.querySelector('[data-alt="Codifi"]')).toHaveAttribute(
      'data-src',
      codifiLogo,
    )

    cleanup()
    render(<Journey data={makeCard('codifi')} phase={3} />)
    expect(document.querySelector('[data-alt="codifi"]')).toHaveAttribute('data-src', '')
  })
})
