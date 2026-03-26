'use client'

import { useCheckIsAuthenticated } from '@/hooks/useCheckIsAuthenticated'
import { PageMain } from '@/ui/templates/PagaMain'
import { PageHeader } from '@/ui/templates/PageHeader'

import { NanoBananaPlayground } from './NanoBananaPlayground'

export default function NanoBananaPage() {
  useCheckIsAuthenticated()

  return (
    <PageMain>
      <div className="relative px-2 py-8">
        <PageHeader
          title="Nano Banana"
          description="Create square images with Gemini 3.1 Flash Image (Nano Banana 2). Requires GEMINI_API_KEY and billing for image quota."
          subtitle="Playground"
        />
        <NanoBananaPlayground />
      </div>
    </PageMain>
  )
}
