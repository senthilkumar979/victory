'use client'

import { RadialOrbitalTimeline } from '@/components/ui/radial-orbital-timeline'
import { agileTimelineData } from './agileTimelineData'

export const AgileProductTimelineSection = () => (
  <section
    className="w-full mt-2 mb-2 lg:mb-10 lg:mt-10"
    aria-labelledby="agile-timeline-visual-label"
  >
    <h3
      id="agile-timeline-visual-label"
      className="text-slate-900 border-l-2 border-primary pl-2 font-semibold letter-spacing-wide"
    >
      Agile phase timeline
    </h3>
    <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed lg:mt-10 text-slate-600 dark:text-slate-400 mb-10">
      The timeline below reflects how we worked:{' '}
      <span className="font-medium text-slate-800 dark:text-slate-200">
        design thinking
      </span>{' '}
      to understand and validate ideas,{' '}
      <span className="font-medium text-slate-800 dark:text-slate-200">
        agile ceremonies
      </span>{' '}
      to keep momentum and quality, and{' '}
      <span className="font-medium text-slate-800 dark:text-slate-200">
        iterative delivery
      </span>{' '}
      so each product grew in deliberate steps until it was ready for users.
      Every phase shown is complete—these are the stages we finished to bring
      the solutions on this page to life.
    </p>
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-black/40 overflow-hidden bg-black">
      <RadialOrbitalTimeline timelineData={agileTimelineData} embedded />
    </div>
    <p className="mt-4 text-center text-xs text-slate-500 dark:text-slate-500 max-w-2xl mx-auto lg:mt-10">
      All phases are complete: development for the products on this page is
      finished and the solutions above are live outcomes of this process.
    </p>
  </section>
)
