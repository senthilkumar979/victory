'use client'

import { Button } from '@/ui/atoms/button/Button'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight } from 'lucide-react'

interface BlogsPaginationProps {
  page: number
  totalPages: number
  setPage: (page: number) => void
}

export function BlogsPagination({
  page,
  totalPages,
  setPage,
}: BlogsPaginationProps) {
  const pageNumbers: (number | 'ellipsis')[] = []
  if (totalPages <= 7) {
    pageNumbers.push(...Array.from({ length: totalPages }, (_, i) => i + 1))
  } else {
    pageNumbers.push(1)
    if (page > 3) pageNumbers.push('ellipsis')
    const start = Math.max(2, page - 1)
    const end = Math.min(totalPages - 1, page + 1)
    for (let p = start; p <= end; p++) {
      if (p !== 1 && p !== totalPages) pageNumbers.push(p)
    }
    if (page < totalPages - 2) pageNumbers.push('ellipsis')
    if (totalPages > 1) pageNumbers.push(totalPages)
  }

  return (
    <motion.nav
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.15 }}
      className="flex flex-wrap items-center justify-center gap-2"
      aria-label="Pagination"
    >
      <Button
        variant="tertiary"
        mode="outline"
        size="md"
        onClick={() => setPage(Math.max(1, page - 1))}
        disabled={page <= 1}
        className="gap-1.5"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="hidden sm:inline">Previous</span>
      </Button>
      <div className="flex items-center gap-0.5">
        {pageNumbers.map((item, i) =>
          item === 'ellipsis' ? (
            <span key={`e-${i}`} className="px-2 text-sm text-slate-400">
              …
            </span>
          ) : (
            <Button
              key={item}
              variant={page === item ? 'primary' : 'tertiary'}
              mode="solid"
              size="sm"
              onClick={() => setPage(item)}
              className="min-w-9"
              aria-current={page === item ? 'page' : undefined}
            >
              {item}
            </Button>
          ),
        )}
      </div>
      <Button
        variant="tertiary"
        mode="outline"
        size="md"
        onClick={() => setPage(Math.min(totalPages, page + 1))}
        disabled={page >= totalPages}
        className="gap-1.5"
      >
        <span className="hidden sm:inline">Next</span>
        <ArrowRight className="h-4 w-4" />
      </Button>
    </motion.nav>
  )
}
