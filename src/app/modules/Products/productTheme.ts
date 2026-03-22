import type { ProductTheme } from './product.types'

export const productThemeClasses: Record<
  ProductTheme,
  {
    cardGradient: string
    iconWrap: string
    glow: string
    chip: string
    text: string
  }
> = {
  emerald: {
    cardGradient:
      'from-emerald-500/[0.12] via-teal-500/[0.08] to-cyan-500/[0.14]',
    iconWrap:
      'bg-gradient-to-br from-emerald-400/30 to-cyan-500/25 text-emerald-950 shadow-emerald-500/20',
    glow: 'bg-emerald-400/25',
    chip: 'border-emerald-400/40 bg-emerald-500/10 text-emerald-900',
    text: 'text-emerald-900',
  },
  violet: {
    cardGradient:
      'from-violet-500/[0.12] via-fuchsia-500/[0.08] to-indigo-500/[0.14]',
    iconWrap:
      'bg-gradient-to-br from-violet-400/35 to-indigo-500/30 text-violet-950 shadow-violet-500/25',
    glow: 'bg-violet-400/25',
    chip: 'border-violet-400/40 bg-violet-500/10 text-violet-900',
    text: 'text-violet-900',
  },
  amber: {
    cardGradient:
      'from-amber-500/[0.14] via-orange-500/[0.08] to-rose-500/[0.12]',
    iconWrap:
      'bg-gradient-to-br from-amber-400/35 to-orange-500/30 text-amber-950 shadow-amber-500/25',
    glow: 'bg-amber-400/25',
    chip: 'border-amber-400/40 bg-amber-500/10 text-amber-950',
    text: 'text-amber-950',
  },
}
