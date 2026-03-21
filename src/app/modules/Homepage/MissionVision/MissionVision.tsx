'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { Compass, Sparkles } from 'lucide-react'

import { missionVisionContent as c } from './missionVisionContent'
import { MissionVisionBridge } from './MissionVisionBridge'

export default function MissionVision() {
  const reduce = useReducedMotion() ?? false
  const slide = reduce ? 12 : 40
  const dur = reduce ? 0.2 : 0.7
  const ease = [0.22, 1, 0.36, 1] as const

  return (
    <section className="relative isolate overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(99,102,241,0.09),transparent_55%),radial-gradient(ellipse_70%_50%_at_100%_50%,rgba(139,92,246,0.06),transparent_50%),linear-gradient(to_bottom_right,#fafaf9,#ffffff,#f5f3ff)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.07)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.07)_1px,transparent_1px)] bg-[size:56px_56px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full bg-sky-300/25 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-violet-400/20 blur-3xl"
        aria-hidden
      />

      <motion.div
        initial={{ opacity: 0, y: reduce ? 0 : 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-72px' }}
        transition={{ duration: dur, ease }}
        className="relative mx-auto max-w-7xl px-6 py-24"
      >
        <p className="mb-14 text-center font-mono text-[11px] font-medium uppercase tracking-[0.35em] bg-primary w-fit p-2 text-center mx-auto text-white rounded-full">
          {c.sectionKicker}
        </p>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:items-stretch lg:gap-8 xl:gap-12">
          <motion.article
            initial={{ opacity: 0, x: reduce ? 0 : -slide }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: dur, delay: reduce ? 0 : 0.06, ease }}
            className="group relative flex-1 lg:max-w-[min(100%,26rem)] lg:pr-6 xl:pr-10"
          >
            <span
              className="pointer-events-none absolute -left-1 -top-2 select-none font-mono text-[clamp(4rem,12vw,6.5rem)] font-bold leading-none text-slate-200/90"
              aria-hidden
            >
              01
            </span>
            <div className="relative overflow-hidden rounded-[1.35rem] border border-slate-200/90 bg-white/85 p-8 shadow-[0_24px_80px_-32px_rgba(15,23,42,0.12)] backdrop-blur-md transition-all duration-300 ease-out before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-pink-400/40 before:to-transparent hover:-translate-y-1 hover:shadow-[0_32px_90px_-28px_rgba(237, 58, 237, 0.18)]">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-slate-200/80 bg-slate-50/90 text-primary shadow-sm transition-transform duration-300 ease-out group-hover:-rotate-[8deg]">
                  <Compass className="h-6 w-6" strokeWidth={1.5} aria-hidden />
                </div>
                <span className="font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-slate-500">
                  {c.mission.zone}
                </span>
              </div>
              <p className="text-sm font-semibold uppercase tracking-wider text-primary">
                {c.mission.eyebrow}
              </p>
              <h2 className="mt-2 text-balance text-3xl font-bold tracking-tight text-slate-900 md:text-[2rem] md:leading-[1.2]">
                {c.mission.title}
              </h2>
              <p className="mt-5 border-l-2 border-primary/80 pl-4 text-[0.95rem] leading-relaxed text-slate-600">
                {c.mission.body}
              </p>
            </div>
          </motion.article>

          <MissionVisionBridge
            from={c.bridge.from}
            to={c.bridge.to}
            reduceMotion={reduce}
          />

          <motion.article
            initial={{ opacity: 0, x: reduce ? 0 : slide }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: dur, delay: reduce ? 0 : 0.1, ease }}
            className="group relative flex-1 lg:max-w-[min(100%,26rem)] lg:pl-6 xl:pl-10"
          >
            <span
              className="pointer-events-none absolute -right-1 -top-2 select-none font-mono text-[clamp(4rem,12vw,6.5rem)] font-bold leading-none text-violet-200/90"
              aria-hidden
            >
              02
            </span>
            <div className="relative overflow-hidden rounded-[1.35rem] border border-violet-200/45 bg-gradient-to-br from-white via-violet-50/40 to-indigo-50/60 p-8 shadow-[0_24px_80px_-32px_rgba(211, 40, 217, 0.15)] backdrop-blur-md transition-all duration-300 ease-out after:pointer-events-none after:absolute after:inset-0 after:rounded-[1.35rem] after:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.6)] hover:-translate-y-1 hover:shadow-[0_36px_100px_-24px_rgba(237, 58, 237, 0.28)]">
              <div className="pointer-events-none absolute -right-16 top-0 h-48 w-48 rounded-full bg-gradient-to-br from-fuchsia-400/25 via-purple-400/15 to-transparent blur-2xl" />
              <div className="pointer-events-none absolute -left-10 bottom-0 h-40 w-40 rounded-full bg-pink-400/15 blur-3xl" />
              <div className="relative mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-violet-200/70 text-primary shadow-sm transition-transform duration-300 ease-out group-hover:rotate-[10deg]">
                  <Sparkles className="h-6 w-6" strokeWidth={1.5} aria-hidden />
                </div>
                <span className="font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-slate-500">
                  {c.vision.zone}
                </span>
              </div>
              <p className="text-sm font-semibold uppercase tracking-wider text-primary">
                {c.vision.eyebrow}
              </p>
              <h2 className="mt-2 text-balance bg-gradient-to-r from-purple-900 via-pink-900 to-primary bg-clip-text text-3xl font-bold tracking-tight text-transparent md:text-[2rem] md:leading-[1.2]">
                {c.vision.title}
              </h2>
              {/* <p className="mt-5 text-[0.95rem] leading-relaxed text-slate-600">
                {c.vision.body}
              </p> */}
              <p className="mt-5 border-l-2 border-primary/80 pl-4 text-[0.95rem] leading-relaxed text-slate-600">
                {c.vision.body}
              </p>
            </div>
          </motion.article>
        </div>

        <div className="mx-auto mt-16 max-w-2xl border-t border-slate-200/70 pt-10">
          <p className="text-center font-serif text-lg italic leading-relaxed text-slate-700 md:text-xl">
            {c.footerLine}
          </p>
        </div>
      </motion.div>
    </section>
  )
}
