'use client'

import { motion, type Variants } from 'framer-motion'
import { AlertCircle, ImageIcon } from 'lucide-react'
import { useCallback, useState } from 'react'

import type { CloudinaryImage } from '@/types/gallery.types'

import { GalleryImageCard } from './GalleryImageCard'
import { GalleryLightbox } from './GalleryLightbox'

interface GalleryGridProps {
  images: CloudinaryImage[]
  loading: boolean
  error: string | null
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.08 },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

const ErrorState = ({ message }: { message: string }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.98, y: 20 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    className="flex flex-col items-center justify-center rounded-2xl border border-red-200/80 bg-gradient-to-br from-red-50/90 to-red-50/50 px-8 py-16 text-center shadow-sm"
  >
    <AlertCircle className="size-14 text-red-500" strokeWidth={1.5} />
    <h3 className="mt-4 text-lg font-semibold text-slate-900">Unable to load gallery</h3>
    <p className="mt-2 max-w-md text-sm text-slate-600">{message}</p>
  </motion.div>
)

const LoadingSkeleton = () => (
  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3">
    {Array.from({ length: 12 }).map((_, i) => (
      <div
        key={i}
        className="aspect-[4/3] animate-pulse rounded-2xl bg-slate-800 shadow-lg"
      />
    ))}
  </div>
)

const EmptyState = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-gradient-to-br from-slate-50/80 to-white px-8 py-20 text-center"
  >
    <ImageIcon className="size-20 text-slate-300" strokeWidth={1} aria-hidden />
    <h3 className="mt-4 text-lg font-semibold text-slate-700">No images found</h3>
    <p className="mt-2 max-w-sm text-sm text-slate-500">
      Check back later for new gallery content.
    </p>
  </motion.div>
)

export const GalleryGrid = ({ images, loading, error }: GalleryGridProps) => {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)

  const openLightbox = useCallback((index: number) => {
    setCurrentIndex(index)
    setLightboxOpen(true)
  }, [])

  const closeLightbox = useCallback(() => setLightboxOpen(false), [])

  const handleNavigate = useCallback((index: number) => setCurrentIndex(index), [])

  if (loading) return <LoadingSkeleton />
  if (error) return <ErrorState message={error} />
  if (images.length === 0) return <EmptyState />

  return (
    <>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3"
      >
        {images.map((image, index) => (
          <motion.div key={image.id} variants={itemVariants}>
            <GalleryImageCard
              image={image}
              index={index}
              onClick={() => openLightbox(index)}
            />
          </motion.div>
        ))}
      </motion.div>

      <GalleryLightbox
        images={images}
        currentIndex={currentIndex}
        isOpen={lightboxOpen}
        onClose={closeLightbox}
        onNavigate={handleNavigate}
      />
    </>
  )
}
