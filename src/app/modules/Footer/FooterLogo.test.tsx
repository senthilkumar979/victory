import type { HTMLAttributes, ImgHTMLAttributes, ReactNode } from 'react'

import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { MENTORBRIDGE_LONG_LOGO_URL } from '@/constants/CompanyConstants'

import { FooterLogo } from './FooterLogo'

interface MockImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  alt: string
  src: string | { src: string }
}

interface MockMotionDivProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode
  initial?: unknown
  transition?: unknown
  viewport?: unknown
  whileInView?: unknown
}

vi.mock('next/image', async () => {
  const React = await import('react')

  return {
    default: ({ src, alt, ...props }: MockImageProps) =>
      React.createElement('img', {
        ...props,
        alt,
        src: typeof src === 'string' ? src : src.src,
      }),
  }
})

vi.mock('framer-motion', async () => {
  const React = await import('react')

  return {
    motion: {
      div: ({
        children,
        initial: _initial,
        transition: _transition,
        viewport: _viewport,
        whileInView: _whileInView,
        ...props
      }: MockMotionDivProps) => React.createElement('div', props, children),
    },
  }
})

describe('FooterLogo', () => {
  it('renders the MentorBridge wordmark with the footer sizing that prevents regressions', () => {
    render(<FooterLogo />)

    const logo = screen.getByRole('img', { name: 'MentorBridge' })

    expect(logo).toHaveAttribute('src', MENTORBRIDGE_LONG_LOGO_URL)
    expect(logo).toHaveAttribute('width', '650')
    expect(logo).toHaveAttribute('height', '125')
    expect(logo).toHaveClass('w-[650px]')
    expect(
      screen.getByText(/empowering the next generation of builders/i),
    ).toBeInTheDocument()
  })
})
