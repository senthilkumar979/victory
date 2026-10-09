import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { Breadcrumbs } from './Breadcrumbs'

describe('Breadcrumbs', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders nothing when there are no crumbs', () => {
    const { container } = render(<Breadcrumbs items={[]} />)

    expect(container).toBeEmptyDOMElement()
  })

  it('keeps the current page out of the link list', () => {
    render(
      <Breadcrumbs
        ariaLabel="Profile trail"
        separator=">"
        items={[
          { label: 'Students', href: '/students' },
          { label: 'Ada', href: '/students/ada' },
          { label: 'Edit', href: '/students/ada/edit' },
        ]}
      />,
    )

    expect(screen.getByRole('navigation', { name: 'Profile trail' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Students' })).toHaveAttribute(
      'href',
      '/students',
    )
    expect(screen.queryByRole('link', { name: 'Edit' })).not.toBeInTheDocument()
    expect(screen.getByText('Edit')).toHaveAttribute('aria-current', 'page')
    expect(screen.getAllByText('>')).toHaveLength(2)
    expect(screen.getByText('Ada').closest('a')).toHaveAttribute('href', '/students/ada')
  })

  it('does not link a middle crumb that has no href', () => {
    render(
      <Breadcrumbs
        items={[{ label: 'Home' }, { label: 'Current', href: '/current' }]}
      />,
    )

    expect(screen.queryByRole('link')).not.toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument()
    expect(screen.getByText('Home')).not.toHaveAttribute('aria-current')
    expect(screen.getByText('Current')).toHaveAttribute('aria-current', 'page')
  })
})
