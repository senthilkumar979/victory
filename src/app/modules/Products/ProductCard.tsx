'use client'

import { Button } from '@/ui/atoms/button/Button'
import { motion } from 'framer-motion'
import { ArrowUpRight, Globe2Icon, Sparkles } from 'lucide-react'
import Image from 'next/image'
import type { Product } from './product.types'
import { productThemeClasses } from './productTheme'

interface ProductCardProps {
  product: Product
  index: number
  onOpen: (product: Product) => void
}

export const ProductCard = ({ product, index, onOpen }: ProductCardProps) => {
  const theme = productThemeClasses[product.theme]

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.45,
        delay: index * 0.08,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200/80 p-px shadow-[0_24px_80px_-24px_rgba(15,23,42,0.35)] dark:border-slate-700/60"
    >
      <div
        className={`pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full blur-3xl ${theme.glow}`}
      />
      <div
        className={`relative flex h-full flex-col rounded-[1.4rem] bg-gradient-to-br ${theme.cardGradient} p-6 sm:p-8`}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div
            className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl shadow-lg ring-1 ring-white/40`}
          >
            {/* <Icon className="h-7 w-7" strokeWidth={1.75} /> */}
            <Image
              src={product.imageUrl}
              alt={product.name}
              width={28}
              height={28}
            />
          </div>
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${theme.chip}`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            {product.category}
          </span>
        </div>
        <h2
          className={`font-['Urbanist',system-ui,sans-serif] text-2xl font-bold tracking-tight ${theme.text} letter-spacing-wide`}
        >
          {product.name}
        </h2>
        <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-600">
          {product.tagline}
        </p>
        <ul className="mt-5 space-y-2 border-t border-slate-200/60 pt-5 dark:border-slate-600/50">
          {product.features.slice(0, 3).map((f) => (
            <li
              key={f}
              className="flex items-center gap-2 text-xs font-medium text-slate-700"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-slate-400 dark:bg-slate-500" />
              {f}
            </li>
          ))}
        </ul>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200/50 pt-5 dark:border-slate-600/40">
          <button
            type="button"
            onClick={() => onOpen(product)}
            className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
          >
            Explore
            <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </button>
          <Button
            variant="primary"
            size="sm"
            className="pointer-events-auto"
            onClick={() => window.open(product.websiteUrl, '_blank')}
          >
            <Globe2Icon className="h-4 w-4" />
            Visit Website
          </Button>
        </div>
      </div>
    </motion.article>
  )
}
