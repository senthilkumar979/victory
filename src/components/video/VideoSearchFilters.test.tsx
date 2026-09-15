import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { SESSION_VIDEO_CATEGORIES } from '@/lib/sessionVideos/sessionVideoCategories'
import {
  DEFAULT_VIDEO_BROWSE_FILTERS,
  type VideoBrowseFilters,
} from '@/lib/sessionVideos/videoBrowseFilters'

import { VideoSearchFilters } from './VideoSearchFilters'

const FiltersHarness = () => {
  const [filters, setFilters] = useState<VideoBrowseFilters>(DEFAULT_VIDEO_BROWSE_FILTERS)
  return (
    <>
      <VideoSearchFilters filters={filters} onChange={setFilters} />
      <p>query:{filters.query}</p>
      <p>category:{filters.category}</p>
      <p>sort:{filters.sort}</p>
    </>
  )
}

afterEach(() => {
  cleanup()
})

describe('VideoSearchFilters', () => {
  it('patches query, category, and sort independently', async () => {
    const user = userEvent.setup()
    render(<FiltersHarness />)

    await user.type(screen.getByPlaceholderText('Search videos by title...'), 'hooks')
    await user.selectOptions(screen.getByDisplayValue('All categories'), 'react_session')
    await user.selectOptions(screen.getByDisplayValue('Sort: Relevance'), 'views')

    expect(screen.getByText('query:hooks')).toBeInTheDocument()
    expect(screen.getByText(`category:${SESSION_VIDEO_CATEGORIES.REACT_SESSION}`)).toBeInTheDocument()
    expect(screen.getByText('sort:views')).toBeInTheDocument()
  })

  it('pluralizes result counts and hides them when unspecified', () => {
    const { rerender } = render(
      <VideoSearchFilters
        filters={DEFAULT_VIDEO_BROWSE_FILTERS}
        onChange={vi.fn()}
        resultCount={0}
      />,
    )
    expect(screen.getByText('0 videos found')).toBeInTheDocument()

    rerender(
      <VideoSearchFilters
        filters={DEFAULT_VIDEO_BROWSE_FILTERS}
        onChange={vi.fn()}
        resultCount={1}
      />,
    )
    expect(screen.getByText('1 video found')).toBeInTheDocument()

    rerender(
      <VideoSearchFilters filters={DEFAULT_VIDEO_BROWSE_FILTERS} onChange={vi.fn()} />,
    )
    expect(screen.queryByText(/found/)).not.toBeInTheDocument()
  })
})
