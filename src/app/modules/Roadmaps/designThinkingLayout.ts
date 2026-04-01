/** Geometry + ids for DesignThinkingRoadmap — keep in sync with data/roadmaps/design-thinking.ts */

export const DT_VB_W = 600
export const DT_CX = 300
export const DT_MAIN_W = 154.3
export const DT_MAIN_H = 28.3
export const DT_BR_W = 128
export const DT_BR_H = 28.3
export const DT_GAP = 26
export const DT_TOP = 32

export const DT_MAIN = [
  { id: 'dt-intro', label: 'Design Thinking' },
  { id: 'dt-empathize', label: 'Empathize' },
  { id: 'dt-define', label: 'Define' },
  { id: 'dt-ideate', label: 'Ideate' },
  { id: 'dt-prototype', label: 'Prototype' },
  { id: 'dt-test', label: 'Test & learn' },
] as const

export const DT_BRANCHES = [
  { id: 'dt-user-research', label: 'User research', mainIndex: 1, side: 'left' as const },
  { id: 'dt-empathy-map', label: 'Empathy maps', mainIndex: 1, side: 'right' as const },
  { id: 'dt-problem-frame', label: 'Problem framing', mainIndex: 2, side: 'left' as const },
  { id: 'dt-pov-hmw', label: 'POV & HMW', mainIndex: 2, side: 'right' as const },
  { id: 'dt-diverge', label: 'Divergent ideation', mainIndex: 3, side: 'left' as const },
  { id: 'dt-converge', label: 'Converge & select', mainIndex: 3, side: 'right' as const },
  { id: 'dt-lowfi', label: 'Low-fidelity builds', mainIndex: 4, side: 'left' as const },
  { id: 'dt-feedback', label: 'Feedback loops', mainIndex: 4, side: 'right' as const },
] as const

export function dtMainY(i: number) {
  return DT_TOP + i * (DT_MAIN_H + DT_GAP)
}

export function dtMainX0() {
  return DT_CX - DT_MAIN_W / 2
}
