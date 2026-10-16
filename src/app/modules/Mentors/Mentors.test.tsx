import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode, Ref } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import Mentors from './Mentors'

const MOTION_PROPS = new Set([
  'initial',
  'animate',
  'exit',
  'transition',
  'layout',
  'whileHover',
  'whileTap',
])

vi.mock('next/image', () => ({
  default: function NextImageMock({ alt }: { alt?: string }) {
    return <span data-alt={alt ?? ''} />
  },
}))

vi.mock('framer-motion', async () => {
  const React = await import('react')

  function createMotion(tag: string) {
    return React.forwardRef(function MotionElement(
      props: { children?: ReactNode },
      ref: Ref<HTMLElement>,
    ) {
      const domProps = Object.fromEntries(
        Object.entries(props).filter(([key]) => !MOTION_PROPS.has(key)),
      )
      return React.createElement(tag, { ...domProps, ref }, props.children)
    })
  }

  return {
    AnimatePresence: function AnimatePresenceMock({
      children,
    }: {
      children?: ReactNode
    }) {
      return children
    },
    motion: {
      div: createMotion('div'),
      button: createMotion('button'),
      article: createMotion('article'),
    },
  }
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe('Mentors', () => {
  it('swaps the featured mentor and opens that mentor’s LinkedIn profile', async () => {
    const user = userEvent.setup()
    const open = vi.spyOn(window, 'open').mockImplementation(() => null)

    render(<Mentors />)

    expect(
      screen.getByRole('heading', { level: 3, name: 'Senthil Kumar Thangavel' }),
    ).toBeInTheDocument()

    await user.click(
      screen.getByRole('button', { name: 'View LinkedIn Profile' }),
    )
    expect(open).toHaveBeenCalledWith(
      'https://www.linkedin.com/in/senthilk979/',
      '_blank',
    )

    await user.click(
      screen.getByRole('button', {
        name: 'Show Dhileepan Dhanapal as featured mentor',
      }),
    )

    expect(
      screen.getByRole('heading', { level: 3, name: 'Dhileepan Dhanapal' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', {
        name: 'Show Senthil Kumar Thangavel as featured mentor',
      }),
    ).toBeInTheDocument()

    await user.click(
      screen.getByRole('button', { name: 'View LinkedIn Profile' }),
    )
    expect(open).toHaveBeenLastCalledWith(
      'https://www.linkedin.com/in/dhileepan-dhanapal-31901224/',
      '_blank',
    )
  })
})
