export type CodingDifficulty = 'beginner' | 'mid' | 'expert'

export interface CodingAnswerFile {
  /** Display path, e.g. `utils/cart.js` */
  path: string
  language: string
  code: string
}

export interface CodingExercise {
  id: string
  difficulty: CodingDifficulty
  title: string
  /** Rich scenario copy (plain text; line breaks preserved) */
  scenario: string
  /** Optional bullet constraints */
  constraints?: string[]
  /** Ordered hints; revealed one at a time via UI */
  hints: string[]
  answerFiles: CodingAnswerFile[]
}
