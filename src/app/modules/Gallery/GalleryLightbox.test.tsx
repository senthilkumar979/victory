import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import type { CloudinaryImage } from '@/types/gallery.types'

import { GalleryLightbox } from './GalleryLightbox'

vi.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: { children: ReactNode }) => children,
  motion: {
    div: ({
      children,
      onClick,
      className,
    }: {
      children?: ReactNode
      onClick?: () => void
      className?: string
    }) => (
      <div onClick={onClick} className={className}>
        {children}
      </div>
    ),
    img: ({ alt, src }: { alt?: string; src?: string }) => (
      <span data-alt={alt} data-src={src} />
    ),
  },
}))

function image(id: string, folder: string): CloudinaryImage {
  return {
    id,
    src: `https://cdn.example/${id}.jpg`,
    title: id,
    alt: `${id} alt`,
    public_id: id,
    width: 100,
    height: 80,
    folder,
  }
}

const images = [
  image('one', 'batch_2025'),
  image('two', 'unknown_folder'),
  image('three', 'Tamilpreneur'),
]

describe('GalleryLightbox', () => {
  afterEach(() => {
    cleanup()
    document.body.style.overflow = ''
  })

  it('hides the previous control on the first image and ignores ArrowLeft', () => {
    const onNavigate = vi.fn()
    const onClose = vi.fn()
    render(
      <GalleryLightbox
        images={images}
        currentIndex={0}
        isOpen
        onClose={onClose}
        onNavigate={onNavigate}
      />,
    )

    expect(screen.queryByRole('button', { name: 'Previous image' })).toBeNull()
    expect(screen.getByRole('button', { name: 'Next image' })).toBeInTheDocument()
    expect(screen.getByText('Batch 2025')).toBeInTheDocument()
    expect(screen.getByText('1 / 3')).toBeInTheDocument()
    expect(document.body.style.overflow).toBe('hidden')

    fireEvent.keyDown(window, { key: 'ArrowLeft' })
    expect(onNavigate).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: 'Next image' }))
    expect(onNavigate).toHaveBeenCalledWith(1)
    expect(onClose).not.toHaveBeenCalled()
  })

  it('hides the next control on the last image and closes from Escape or the backdrop', () => {
    const onNavigate = vi.fn()
    const onClose = vi.fn()
    render(
      <GalleryLightbox
        images={images}
        currentIndex={2}
        isOpen
        onClose={onClose}
        onNavigate={onNavigate}
      />,
    )

    expect(screen.queryByRole('button', { name: 'Next image' })).toBeNull()
    expect(screen.getByText('Tamilpreneur Startup event')).toBeInTheDocument()
    expect(screen.getByText('3 / 3')).toBeInTheDocument()

    fireEvent.keyDown(window, { key: 'ArrowRight' })
    expect(onNavigate).not.toHaveBeenCalled()

    fireEvent.click(document.querySelector('[data-alt]') as HTMLElement)
    expect(onClose).not.toHaveBeenCalled()

    fireEvent.keyDown(window, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)

    const backdrop = document.body.querySelector('.bg-black\\/95')
    expect(backdrop).not.toBeNull()
    fireEvent.click(backdrop as HTMLElement)
    expect(onClose).toHaveBeenCalledTimes(2)
  })

  it('does not listen for keys or lock scroll while closed', () => {
    const onClose = vi.fn()
    const onNavigate = vi.fn()
    render(
      <GalleryLightbox
        images={images}
        currentIndex={1}
        isOpen={false}
        onClose={onClose}
        onNavigate={onNavigate}
      />,
    )

    expect(screen.queryByText('2 / 3')).toBeNull()
    expect(document.body.style.overflow).toBe('')
    fireEvent.keyDown(window, { key: 'Escape' })
    fireEvent.keyDown(window, { key: 'ArrowRight' })
    expect(onClose).not.toHaveBeenCalled()
    expect(onNavigate).not.toHaveBeenCalled()
  })
})
