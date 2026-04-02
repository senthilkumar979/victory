/** Visual accents for interview prep UI (slug → Tailwind gradient fragments). */
export const INTERVIEW_PREP_HERO_GLOW: Record<string, string> = {
  'core-java': 'from-orange-500/25 via-amber-500/10',
  react: 'from-cyan-500/25 via-teal-500/10',
  'spring-boot': 'from-emerald-500/25 via-green-500/10',
}

export const INTERVIEW_PREP_CARD_BAR: Record<string, string> = {
  'core-java': 'from-orange-400 via-amber-500 to-orange-600',
  react: 'from-cyan-400 via-teal-400 to-cyan-600',
  'spring-boot': 'from-emerald-400 via-green-500 to-emerald-700',
}

export function interviewPrepHeroGlow(slug: string): string {
  return INTERVIEW_PREP_HERO_GLOW[slug] ?? 'from-primary/25 via-primary/5'
}

export function interviewPrepCardBar(slug: string): string {
  return INTERVIEW_PREP_CARD_BAR[slug] ?? 'from-primary via-primary/60 to-primary'
}
