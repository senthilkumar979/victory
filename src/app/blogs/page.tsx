'use client'

import { BlogFilter } from '@/app/blogs/components/BlogFilter'
import { BlogGrid } from '@/app/blogs/components/BlogGrid'
import { FeaturedCarousel } from '@/app/blogs/components/FeaturedCarousel'
import { Next5List } from '@/app/blogs/components/Next5List'
import { Pagination } from '@/app/blogs/components/Pagination'
import { useBlogs } from '@/hooks/useBlogs'
import { Alert } from '@/ui/atoms/alert/Alert'
import { AnimatePresence, motion } from 'framer-motion'
import { PageMain } from '../../ui/templates/PagaMain'
import { PageHeader } from '../../ui/templates/PageHeader'

export default function BlogsPage() {
  const {
    featured,
    next5,
    remaining,
    authors,
    heroLoading,
    remainingLoading,
    error,
    totalCount,
    remainingPage,
    totalRemainingPages,
    setRemainingPage,
    authorFilter,
    setAuthorFilter,
  } = useBlogs()

  const hasRemaining = totalCount > 10

  return (
    <PageMain>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <PageHeader
          title="Blogs"
          description="Explore our collection of blogs from our creators."
          subtitle="Stories and Tutorials"
        />
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-center lg:justify-end">
          <div className="shrink-0">
            <BlogFilter
              authors={authors}
              value={authorFilter}
              onChange={setAuthorFilter}
              disabled={heroLoading}
            />
          </div>
        </header>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6"
          >
            <Alert color="error" title="Error" message={error} />
          </motion.div>
        )}

        {/* Hero: Featured carousel + Next 5 */}
        <section className="mb-12 grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
          <div className="lg:col-span-2">
            {heroLoading ? (
              <div className="flex h-[360px] animate-pulse flex-col overflow-hidden rounded-2xl bg-slate-200" />
            ) : (
              <FeaturedCarousel blogs={featured} />
            )}
          </div>
          <div className="lg:col-span-1">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500">
              More top stories
            </h2>
            {heroLoading ? (
              <div className="flex flex-col gap-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="flex gap-3 rounded-xl border border-slate-200 bg-white p-3"
                  >
                    <div className="h-20 w-28 shrink-0 animate-pulse rounded-lg bg-slate-200" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
                      <div className="h-3 w-2/3 animate-pulse rounded bg-slate-200" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Next5List blogs={next5} />
            )}
          </div>
        </section>

        {/* Remaining list */}
        {hasRemaining && (
          <section>
            <h2 className="mb-6 text-xl font-bold text-slate-900">
              More stories
            </h2>
            <AnimatePresence mode="wait">
              {remainingLoading ? (
                <motion.div
                  key="remaining-loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
                >
                  {Array.from({ length: 6 }, (_, i) => (
                    <div
                      key={`sk-${i}`}
                      className="overflow-hidden rounded-2xl bg-white shadow-md"
                    >
                      <div className="aspect-[16/10] animate-pulse bg-slate-200" />
                      <div className="space-y-3 p-5">
                        <div className="h-5 w-4/5 animate-pulse rounded bg-slate-200" />
                        <div className="h-4 w-1/3 animate-pulse rounded bg-slate-200" />
                      </div>
                    </div>
                  ))}
                </motion.div>
              ) : remaining.length === 0 ? (
                <motion.p
                  key="remaining-empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-12 text-center text-slate-500"
                >
                  No more stories.
                </motion.p>
              ) : (
                <motion.div
                  key={`remaining-${remainingPage}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <BlogGrid blogs={remaining} />
                </motion.div>
              )}
            </AnimatePresence>

            {totalRemainingPages > 1 && !remainingLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="mt-10 flex justify-center"
              >
                <Pagination
                  currentPage={remainingPage}
                  totalPages={totalRemainingPages}
                  onPageChange={setRemainingPage}
                />
              </motion.div>
            )}

            {hasRemaining && !remainingLoading && remaining.length > 0 && (
              <p className="mt-4 text-center text-sm text-slate-500">
                Showing {11 + (remainingPage - 1) * 20}–
                {Math.min(10 + remainingPage * 20, totalCount)} of {totalCount}
              </p>
            )}
          </section>
        )}

        {/* Empty state when no blogs at all */}
        {!heroLoading && totalCount === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-24"
          >
            <p className="text-center text-slate-500">No blogs available</p>
          </motion.div>
        )}
      </div>
    </PageMain>
  )
}
