'use client'

import { motion } from 'framer-motion'
import { Maximize2 } from 'lucide-react'

import type { CloudinaryImage } from '@/types/gallery.types'

import { getDisplayFolderName } from './galleryUtils'
import { CloudinaryFolder, getFolderName } from '../../../constants/cloudinary'

interface GalleryImageCardProps {
  image: CloudinaryImage
  index: number
  onClick: () => void
}

export const GalleryImageCard = ({
  image,
  index,
  onClick,
}: GalleryImageCardProps) => {
  const { src, alt, title, folder } = image

  return (
    <motion.article
      layout
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.35,
        delay: index * 0.04,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{
        y: -6,
        scale: 1.02,
        transition: { type: 'spring', stiffness: 400, damping: 22 },
      }}
      whileTap={{ scale: 0.98 }}
      className="group relative aspect-[4/3] cursor-pointer overflow-hidden rounded-2xl bg-slate-900 shadow-lg ring-1 ring-slate-800/80 transition-shadow hover:shadow-2xl hover:ring-primary/30"
      onClick={onClick}
    >
      <img
        src={src}
        alt={alt || title || 'Gallery image'}
        loading="lazy"
        width={400}
        height={300}
        className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="absolute inset-0 flex flex-col justify-between p-4 opacity-0 transition-all duration-300 group-hover:opacity-100">
        <div className="flex justify-end">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/15 backdrop-blur-md ring-1 ring-white/20 shadow-lg transition-transform duration-200 group-hover:scale-110">
            <Maximize2 className="size-5 text-white" strokeWidth={2.5} />
          </span>
        </div>
        <div className="space-y-1.5">
          <p className="text-xs font-medium uppercase tracking-widest text-primary/90">
            {getFolderName(folder as CloudinaryFolder)}
          </p>
        </div>
      </div>
    </motion.article>
  )
}
