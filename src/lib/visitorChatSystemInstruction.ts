import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * Loaded from plain text so prompt text never goes through JS string / Turbopack parsing.
 */
const __dirname = dirname(fileURLToPath(import.meta.url))

function loadVisitorChatPrompt(): string {
  const nextToModule = join(__dirname, 'visitorChatPrompt.txt')
  if (existsSync(nextToModule)) {
    return readFileSync(nextToModule, 'utf8')
  }
  const fromRepoRoot = join(process.cwd(), 'src/lib/visitorChatPrompt.txt')
  return readFileSync(fromRepoRoot, 'utf8')
}

export const VISITOR_ASSISTANT_INSTRUCTION = loadVisitorChatPrompt()
