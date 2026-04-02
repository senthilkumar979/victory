import type { CodingDifficulty } from '@/data/interview-prep'

export function codingDifficultyMeta(difficulty: CodingDifficulty) {
  switch (difficulty) {
    case 'beginner':
      return {
        label: 'Beginner',
        bar: 'from-emerald-400/90 via-teal-400/80 to-cyan-500/90',
        chip: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-300',
      }
    case 'mid':
      return {
        label: 'Mid-level',
        bar: 'from-sky-400/90 via-blue-400/80 to-indigo-500/90',
        chip: 'border-sky-500/25 bg-sky-500/10 text-sky-300',
      }
  }
}
