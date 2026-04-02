import { Breadcrumbs } from '@/atoms/breadcrumbs/Breadcrumbs'
import { getInterviewTrack } from '@/data/interview-prep'
import { InterviewPrepDeck } from '@/modules/InterviewPrep/InterviewPrepDeck'
import { interviewPrepHeroGlow } from '@/modules/InterviewPrep/interviewPrepTheme'
import { PageMain } from '@/templates/PagaMain'
import { ArrowLeft, BookOpen, Keyboard } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params
  const track = getInterviewTrack(slug)
  if (!track) return { title: 'Interview prep' }
  return {
    title: `${track.title} — Interview prep`,
    description: track.description,
  }
}

export default async function InterviewPrepSlugPage({ params }: PageProps) {
  const { slug } = await params
  const track = getInterviewTrack(slug)
  if (!track) notFound()

  const Icon = track.icon
  const glow = interviewPrepHeroGlow(slug)
  const count = track.questions.length

  return (
    <PageMain>
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div
            className={`absolute -top-40 left-1/2 h-[420px] w-[min(100vw,900px)] -translate-x-1/2 rounded-full bg-gradient-to-b ${glow} to-transparent blur-3xl`}
          />
          <div className="absolute inset-0 opacity-40 [background-size:48px_48px] [background-image:linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)]" />
        </div>

        <div className="relative mx-auto max-w-5xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
          <Breadcrumbs
            items={[
              { label: 'Interview Preparation', href: '/interview-prep' },
              { label: track.title },
            ]}
          />

          <header className="mt-10 border-b border-white/[0.06] pb-12">
            <div className="flex flex-col items-center text-center lg:flex-row lg:items-start lg:gap-10 lg:text-left">
              <div
                className={`mb-6 flex size-20 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br ${track.gradient} shadow-2xl lg:mb-0`}
              >
                <Icon
                  className="size-10 text-white drop-shadow-md"
                  aria-hidden
                />
              </div>
              <div className="max-w-3xl flex-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-zinc-500">
                  Practice session
                </p>
                <h1 className="mt-3 font-bungee-tint text-3xl font-bold tracking-tight text-primary sm:text-4xl md:text-5xl">
                  {track.title}
                </h1>
                <p className="mt-4 text-base leading-relaxed text-zinc-400 sm:text-lg">
                  {track.description}
                </p>
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-secondary/80">
                    <BookOpen className="size-4 text-primary" aria-hidden />
                    {count} curated questions
                  </span>
                  <span className="inline-flex gap-2 items-center rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-secondary/80">
                    <Keyboard className="size-4 text-primary" aria-hidden />
                    Swipe cards or use keyboard
                  </span>
                </div>
              </div>
            </div>
          </header>

          <section
            className="mt-12 rounded-3xl border border-white/[0.06] bg-zinc-950/30 p-1 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] backdrop-blur-sm sm:p-2"
            aria-labelledby="deck-heading"
          >
            <h2 id="deck-heading" className="sr-only">
              Questions for {track.title}
            </h2>
            <InterviewPrepDeck trackSlug={slug} />
          </section>

          <div className="mt-12 flex justify-center border-t border-white/[0.06] pt-10">
            <Link
              href="/interview-prep"
              className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-5 py-2.5 text-sm font-medium text-primary transition-colors hover:border-white/20 hover:bg-white/[0.06] hover:text-secondary"
            >
              <ArrowLeft
                className="size-4 transition-transform group-hover:-translate-x-0.5"
                aria-hidden
              />
              All interview topics
            </Link>
          </div>
        </div>
      </div>
    </PageMain>
  )
}
