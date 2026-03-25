'use client'

import { Drawer } from '@/ui/organisms/drawer/Drawer'
import type { LucideIcon } from 'lucide-react'
import { ExternalLink } from 'lucide-react'
import Image from 'next/image'
import type { Product } from './product.types'
import { productThemeClasses } from './productTheme'

interface ProductDetailDrawerProps {
  product: Product | null
  icon: LucideIcon | null
  isOpen: boolean
  onClose: () => void
}

export const ProductDetailDrawer = ({
  product,
  icon: Icon,
  isOpen,
  onClose,
}: ProductDetailDrawerProps) => {
  if (!product) return null

  const theme = productThemeClasses[product.theme]

  return (
    <Drawer isOpen={isOpen} onClose={onClose} size="xxxl" showCloseButton>
      <Drawer.Title description={product.category}>{product.name}</Drawer.Title>
      <Drawer.Body>
        <div className="space-y-8 pb-4">
          <div
            className={`mx-auto flex h-30 w-30 items-center justify-center rounded-3xl shadow-xl ring-1 ring-white/50 ${theme.iconWrap}`}
          >
            <Image
              src={product.imageUrl}
              alt={product.name}
              width={80}
              height={80}
            />
          </div>
          <p className="text-center text-base leading-relaxed text-slate-600 dark:text-slate-300">
            {product.story.lead}
          </p>
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-5 border-slate-600/50 bg-slate-800/40">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-500">
              Highlights
            </h3>
            <ul className="grid gap-2 sm:grid-cols-2 list-none list-inside">
              {product.features.map((f) => (
                <li
                  key={f}
                  className={`rounded-xl border px-3 py-2 text-sm font-medium text-white ${theme.chip}`}
                >
                  {f}
                </li>
              ))}
            </ul>
          </div>
          {product.story.sections.map((section) => (
            <section key={section.title}>
              <h3 className="font-urbanist mb-3 text-lg font-bold text-slate-900 dark:text-slate-50">
                {section.title}
              </h3>
              <div className="space-y-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {section.paragraphs.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </Drawer.Body>
      <Drawer.Footer>
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-end">
          <a
            href={product.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
          >
            Visit product site
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </Drawer.Footer>
    </Drawer>
  )
}
