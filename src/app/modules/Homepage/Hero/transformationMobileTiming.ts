/** Phase 1: student section only (ms). */
export const PHASE_STUDENT_MS = 1500

/** Phase 2: MentorBridge section only (ms). */
export const PHASE_BRIDGE_MS = 1000

/** Phase 3: outcome section only (ms). */
export const PHASE_OUTCOME_MS = 2000

/** One full loop (student → bridge → outcome) before advancing to the next card. */
export const PHASE_CYCLE_MS = PHASE_STUDENT_MS + PHASE_BRIDGE_MS + PHASE_OUTCOME_MS
