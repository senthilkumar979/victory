'use client'

import { useGetPics } from '@/hooks/useGetPics'
import { PageMain } from '@/ui/templates/PagaMain'
import { PageHeader } from '@/ui/templates/PageHeader'
import { GalleryGrid } from '../modules/Gallery/GalleryGrid'

export default function GalleryPage() {
  const { images, isLoading, error } = useGetPics({
    // folders will use the default from constants
    maxResults: 50,
    transformation: 'f_auto,q_auto',
  })

  return (
    <PageMain>
      <div className="py-12">
        <PageHeader
          title="Gallery"
          description="Explore our gallery of images"
          subtitle="Memorable Moments"
        />
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          <GalleryGrid images={images} loading={isLoading} error={error} />
        </div>
      </div>
    </PageMain>
  )
}
