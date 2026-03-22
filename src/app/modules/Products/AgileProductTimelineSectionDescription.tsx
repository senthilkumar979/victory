'use client'

import { CalendarCheck, Lightbulb, Route } from 'lucide-react'

const METHODOLOGY_ITEMS = [
  {
    icon: Lightbulb,
    title: 'Design thinking at the core',
    body:
      'We used design thinking: empathizing with users, defining the right problems, ideating solutions, prototyping, and testing; to make sure each product solved something real before we invested in build-out.',
    accent: 'from-amber-400 via-orange-500 to-rose-500',
    iconBg:
      'bg-gradient-to-br from-amber-400/25 to-orange-500/20 text-amber-900 from-amber-400/20 to-orange-500/15 text-amber-100',
    textColor: 'group-hover:text-warning',
  },
  {
    icon: CalendarCheck,
    title: 'Agile ceremonies we lived by',
    body:
      'Our rhythm came from Kanban-style practice: backlog refinement and sprint planning to shape the work, daily standups to stay aligned, sprint reviews to show working software, and retrospectives to improve how we collaborated every sprint.',
    accent: 'from-teal-400 via-emerald-500 to-cyan-600',
    iconBg:
      'bg-gradient-to-br from-teal-400/25 to-emerald-500/20 text-teal-950 from-teal-400/20 to-emerald-500/15 text-teal-100',
    textColor: 'group-hover:text-teal-500',
  },
  {
    icon: Route,
    title: 'Step-by-step delivery',
    body:
      'Nothing shipped as a single big release. We built incrementally: discovery, planning, implementation, quality checks, and release; so each step validated the last and reduced risk as the product matured.',
    accent: 'from-violet-500 via-indigo-500 to-blue-600',
    iconBg:
      'bg-gradient-to-br from-violet-400/25 to-indigo-500/20 text-violet-950 from-violet-400/20 to-indigo-500/15 text-violet-100',
    textColor: 'group-hover:text-violet-500',
  },
] as const

export const AgileProductTimelineSectionDescription = () => (
  <div className="relative w-full max-w-5xl mx-auto px-1">
    <div
      aria-hidden
      className="pointer-events-none absolute -inset-x-6 -inset-y-8 rounded-[2rem] bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(99,102,241,0.12),transparent_55%),radial-gradient(ellipse_60%_40%_at_100%_50%,rgba(20,184,166,0.08),transparent_50%)] bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(129,140,248,0.15),transparent_55%),radial-gradient(ellipse_60%_40%_at_100%_50%,rgba(45,212,191,0.1),transparent_50%)]"
    />
    <div className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white/70 shadow-lg shadow-slate-200/40 backdrop-blur-sm border-slate-800/90 bg-slate-950/50 shadow-black/30">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-400/40 to-transparent via-indigo-400/25" />
      <div className="px-6 py-10 sm:px-10 sm:py-12">
        <p className="text-center text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-indigo-600 text-indigo-400">
          Methodology
        </p>
        <h2
          id="agile-timeline-heading"
          className="mt-3 text-center text-xl font-semibold tracking-tight text-slate-900 text-slate-50 sm:text-2xl sm:leading-snug"
        >
          Our agile journey — from idea to shipped products
        </h2>

        <div className="mt-3 flex flex-col gap-5">
          {METHODOLOGY_ITEMS.map((item, index) => {
            const Icon = item.icon
            return (
              <article
                key={item.title}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-50/80 transition-shadow hover:shadow-md hover:shadow-slate-200/60 border-slate-800 hover:shadow-black/40"
              >
                <div
                  className={`h-1.5 w-full shrink-0 bg-gradient-to-r ${item.accent}`}
                  aria-hidden
                />
                <div className="flex flex-1 flex-col p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-3">
                    <span
                      className={`font-mono text-3xl font-bold tabular-nums leading-none text-slate-200 transition-colors group-hover:text-slate-300 ${item.textColor}`}
                      aria-hidden
                    >
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span
                      className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-inner ${item.iconBg}`}
                    >
                      <Icon className="h-5 w-5" aria-hidden />
                    </span>
                  </div>
                  <h3 className="mt-5 text-base font-semibold leading-snug text-slate-900 text-slate-100">
                    {item.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600 text-slate-400">
                    {item.body}
                  </p>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </div>
  </div>
)
