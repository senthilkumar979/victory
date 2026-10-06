import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import type { CloudinaryImage } from '@/types/gallery.types'

import { GalleryGrid } from './GalleryGrid'

vi.mock('framer-motion', () => ({
  motion: new Proxy(
    {},
    {
      get: () => 'div',
    },
  ),
}))

vi.mock('./GalleryImageCard', () => ({
  GalleryImageCard: function GalleryImageCard({
    image,
    onClick,
  }: {
    image: CloudinaryImage
    onClick: () => void
  }) {
    return (
      <button type="button" onClick={onClick}>
        {image.title}
      </button>
    )
  },
}))

vi.mock('./GalleryLightbox', () => ({
  GalleryLightbox: function GalleryLightbox({
    isOpen,
    currentIndex,
    onClose,
  }: {
    isOpen: boolean
    currentIndex: number
    onClose: () => void
  }) {
    if (!isOpen) return null
    return (
      <div>
        <span>{`lightbox-${currentIndex}`}</span>
        <button type="button" onClick={onClose}>
          Close lightbox
        </button>
      </div>
    )
  },
}))

afterEach(() => {
  cleanup()
})

function image(title: string): CloudinaryImage {
  return {
    id: title,
    src: `https://res.cloudinary.com/demo/${title}.jpg`,
    title,
    alt: title,
    public_id: title,
    width: 400,
    height: 300,
    folder: 'batch_2025',
  }
}

describe('GalleryGrid', () => {
  it('shows the loading skeleton ahead of an error or an empty list', () => {
    const { container } = render(
      <GalleryGrid images={[]} loading error="Cloudinary failed" />,
    )

    expect(container.querySelectorAll('.animate-pulse')).toHaveLength(12)
    expect(screen.queryByText('Unable to load gallery')).not.toBeInTheDocument()
    expect(screen.queryByText('No images found')).not.toBeInTheDocument()
  })

  it('shows the error message ahead of the empty state', () => {
    render(<GalleryGrid images={[]} loading={false} error="Cloudinary failed" />)

    expect(screen.getByText('Unable to load gallery')).toBeInTheDocument()
    expect(screen.getByText('Cloudinary failed')).toBeInTheDocument()
    expect(screen.queryByText('No images found')).not.toBeInTheDocument()
  })

  it('shows the empty state when the gallery has no images', () => {
    render(<GalleryGrid images={[]} loading={false} error={null} />)

    expect(screen.getByText('No images found')).toBeInTheDocument()
    expect(screen.queryByText('lightbox-0')).not.toBeInTheDocument()
  })

  it('opens the lightbox on the clicked image and closes it', () => {
    render(
      <GalleryGrid
        images={[image('Kickoff'), image('Demo day')]}
        loading={false}
        error={null}
      />,
    )

    expect(screen.queryByText('lightbox-1')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Demo day' }))
    expect(screen.getByText('lightbox-1')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Close lightbox' }))
    expect(screen.queryByText('lightbox-1')).not.toBeInTheDocument()
  })
})
