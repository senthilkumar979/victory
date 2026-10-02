import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { Pagination } from './Pagination'

function pageNumbers() {
  return screen
    .getAllByRole('button')
    .map((button) => button.textContent)
    .filter((label) => label !== 'Prev' && label !== 'Next')
}

describe('Pagination', () => {
  afterEach(() => {
    cleanup()
  })

  it('lists every page when there are five or fewer and clamps the ends', async () => {
    const user = userEvent.setup()
    const onPageChange = vi.fn()
    const { rerender } = render(
      <Pagination currentPage={1} totalPages={5} onPageChange={onPageChange} />,
    )

    expect(pageNumbers()).toEqual(['1', '2', '3', '4', '5'])
    expect(screen.queryByText('…')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Next page' })).toBeEnabled()

    await user.click(screen.getByRole('button', { name: 'Previous page' }))
    expect(onPageChange).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: 'Next page' }))
    expect(onPageChange).toHaveBeenCalledWith(2)

    rerender(
      <Pagination currentPage={1} totalPages={1} onPageChange={onPageChange} />,
    )
    expect(pageNumbers()).toEqual(['1'])
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled()
  })

  it('windows the middle of a long list and keeps the first and last pages', async () => {
    const user = userEvent.setup()
    const onPageChange = vi.fn()
    const { rerender } = render(
      <Pagination currentPage={1} totalPages={6} onPageChange={onPageChange} />,
    )

    expect(pageNumbers()).toEqual(['1', '2', '6'])
    expect(screen.getAllByText('…')).toHaveLength(1)

    rerender(
      <Pagination currentPage={6} totalPages={6} onPageChange={onPageChange} />,
    )
    expect(pageNumbers()).toEqual(['1', '5', '6'])
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled()

    rerender(
      <Pagination currentPage={5} totalPages={10} onPageChange={onPageChange} />,
    )
    expect(pageNumbers()).toEqual(['1', '4', '5', '6', '10'])
    expect(screen.getAllByText('…')).toHaveLength(2)

    await user.click(screen.getByRole('button', { name: '4' }))
    expect(onPageChange).toHaveBeenCalledWith(4)
    await user.click(screen.getByRole('button', { name: 'Next page' }))
    expect(onPageChange).toHaveBeenLastCalledWith(6)
  })
})
