'use client'

import { PageMain } from '@/ui/templates/PagaMain'
import { PageHeader } from '@/ui/templates/PageHeader'
import { Code2, GraduationCap, Shield } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { AgileProductTimelineSection } from './AgileProductTimelineSection'
import { AgileProductTimelineSectionDescription } from './AgileProductTimelineSectionDescription'
import { ProductCard } from './ProductCard'
import { ProductDetailDrawer } from './ProductDetailDrawer'
import type { Product } from './product.types'
import { products } from './productsData'

const ICON_MAP = {
  shield: Shield,
  code2: Code2,
  graduationCap: GraduationCap,
} as const

export const ProductsShowcase = () => {
  const [selected, setSelected] = useState<Product | null>(null)

  const open = useCallback((p: Product) => setSelected(p), [])
  const close = useCallback(() => setSelected(null), [])

  const selectedIcon = useMemo(() => {
    if (!selected) return null
    return ICON_MAP[selected.icon]
  }, [selected])

  return (
    <PageMain>
      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <PageHeader
          title="Products"
          subtitle="Student-built innovation"
          description="Discover the innovative solutions"
        />
        <div className="mx-auto mb-14 max-w-3xl text-center">
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-500">
            We followed <strong>Agile Development Methodology</strong> to build
            these products. These live products demonstrate the practical skills
            and entrepreneurial mindset we cultivate.
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3 mb-20">
          {products.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              index={index}
              onOpen={open}
            />
          ))}
        </div>
        <div className="flex flex-row items-stretch gap-10 lg:gap-12 items-center justify-center">
          <AgileProductTimelineSectionDescription />
          <AgileProductTimelineSection />
        </div>
      </div>
      <ProductDetailDrawer
        product={selected}
        icon={selectedIcon}
        isOpen={selected !== null}
        onClose={close}
      />
    </PageMain>
  )
}
