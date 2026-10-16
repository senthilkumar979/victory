import { cleanup, render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { NavItem } from './NavItem'

const motionState = vi.hoisted(() => ({
  reduced: false,
}))

vi.mock('framer-motion', async () => {
  const React = await import('react')

  const MotionSpan = React.forwardRef(function MotionSpan(
    props: { children?: ReactNode; className?: string; whileHover?: unknown },
    ref: React.Ref<HTMLSpanElement>,
  ) {
    const iconHover = props.className?.includes('h-8')
      ? JSON.stringify(props.whileHover ?? null)
      : undefined
    return (
      <span ref={ref} className={props.className} data-icon-hover={iconHover}>
        {props.children}
      </span>
    )
  })

  return {
    useReducedMotion: () => motionState.reduced,
    motion: { span: MotionSpan },
  }
})

function StudentsIcon() {
  return <svg />
}

const renderItem = (href: string, pathname: string) =>
  render(
    <NavItem href={href} label="Students" icon={StudentsIcon} pathname={pathname} />,
  )

const iconHover = () =>
  document.querySelector('[data-icon-hover]')?.getAttribute('data-icon-hover')

afterEach(() => {
  cleanup()
  motionState.reduced = false
})

describe('NavItem', () => {
  it('marks the current page for an exact path and a nested path', () => {
    const { rerender } = renderItem('/students', '/students')
    expect(screen.getByRole('link', { name: 'Students' })).toHaveAttribute(
      'aria-current',
      'page',
    )

    rerender(
      <NavItem
        href="/students"
        label="Students"
        icon={StudentsIcon}
        pathname="/students/42"
      />,
    )
    expect(screen.getByRole('link', { name: 'Students' })).toHaveAttribute(
      'aria-current',
      'page',
    )
  })

  it('does not highlight a sibling prefix or another branch', () => {
    const { rerender } = renderItem('/students', '/students-archive')
    expect(screen.getByRole('link', { name: 'Students' })).not.toHaveAttribute(
      'aria-current',
    )

    rerender(
      <NavItem
        href="/secured/dashboard"
        label="Students"
        icon={StudentsIcon}
        pathname="/secured/admin"
      />,
    )
    expect(screen.getByRole('link', { name: 'Students' })).not.toHaveAttribute(
      'aria-current',
    )
  })

  it('treats only the site root as the home item', () => {
    const { rerender } = renderItem('/', '/')
    expect(screen.getByRole('link', { name: 'Students' })).toHaveAttribute(
      'aria-current',
      'page',
    )

    rerender(<NavItem href="/" label="Students" icon={StudentsIcon} pathname="" />)
    expect(screen.getByRole('link', { name: 'Students' })).toHaveAttribute(
      'aria-current',
      'page',
    )

    rerender(
      <NavItem href="/" label="Students" icon={StudentsIcon} pathname="/students" />,
    )
    expect(screen.getByRole('link', { name: 'Students' })).not.toHaveAttribute(
      'aria-current',
    )
  })

  it('drops the icon hover motion when the user prefers reduced motion', () => {
    motionState.reduced = true
    renderItem('/students', '/events')
    expect(iconHover()).toBe('null')

    cleanup()
    motionState.reduced = false
    renderItem('/students', '/students')
    expect(iconHover()).toBe(JSON.stringify({ scale: 1.05, rotate: 0 }))

    cleanup()
    renderItem('/students', '/events')
    expect(iconHover()).toBe(JSON.stringify({ scale: 1.05, rotate: -4 }))
  })
})
