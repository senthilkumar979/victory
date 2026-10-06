import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import type { CloudinaryImage } from '@/types/gallery.types'

import { GalleryImageCard } from './GalleryImageCard'

vi.mock('framer-motion', () => ({
  motion: new Proxy(
    {},
    {
      get: (_target, tag) => tag,
    },
  ),
}))

afterEach(() => {
  cleanup()
})

function image(overrides: Partial<CloudinaryImage> = {}): CloudinaryImage {
  return {
    id: 'img-1',
    src: 'https://res.cloudinary.com/demo/photo.jpg',
    title: 'Demo day',
    alt: 'Students presenting',
    public_id: 'photo',
    width: 400,
    height: 300,
    folder: 'technical_training_2025',
    ...overrides,
  }
}

describe('GalleryImageCard', () => {
  it('uses the alt text, then the title, then a generic label', () => {
    const { rerender } = render(
      <GalleryImageCard image={image()} index={0} onClick={vi.fn()} />,
    )
    expect(screen.getByRole('img', { name: 'Students presenting' })).toBeInTheDocument()

    rerender(
      <GalleryImageCard
        image={image({ alt: '', title: 'Demo day' })}
        index={0}
        onClick={vi.fn()}
      />,
    )
    expect(screen.getByRole('img', { name: 'Demo day' })).toBeInTheDocument()

    rerender(
      <GalleryImageCard
        image={image({ alt: '', title: '' })}
        index={0}
        onClick={vi.fn()}
      />,
    )
    expect(screen.getByRole('img', { name: 'Gallery image' })).toBeInTheDocument()
  })

  it('labels a known folder and leaves an unknown folder blank', () => {
    const { rerender } = render(
      <GalleryImageCard image={image()} index={1} onClick={vi.fn()} />,
    )
    expect(screen.getByText('Technical Training Sessions')).toBeInTheDocument()

    rerender(
      <GalleryImageCard
        image={image({ folder: 'campus_visit' })}
        index={1}
        onClick={vi.fn()}
      />,
    )
    expect(screen.queryByText('campus_visit')).not.toBeInTheDocument()
    expect(screen.queryByText('Campus Visit')).not.toBeInTheDocument()
  })

  it('calls onClick when the card is activated', () => {
    const onClick = vi.fn()
    render(<GalleryImageCard image={image()} index={0} onClick={onClick} />)

    fireEvent.click(screen.getByRole('article'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})
