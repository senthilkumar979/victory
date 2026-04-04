/**
 * Fixes common model typos in visitor-chat replies so links, markers, and bullets read correctly.
 */
export function normalizeVisitorChatText(text: string): string {
  let s = text

  // Missing leading "h" in https (models sometimes output ttps://)
  s = s.replace(/\bttps:\/\//gi, 'https://')
  s = s.replace(/\bttp:\/\//gi, 'http://')
  // Missing leading "m" in mail@mentorbridge.in
  s = s.replace(/\bail@mentorbridge\.in\b/gi, 'mail@mentorbridge.in')

  // Malformed [[NAME]] / [[SKILL]] / [[COMPANY]] — one "[" dropped on open/close
  s = s.replace(/(?<!\[)\[NAME\]\]/g, '[[NAME]]')
  s = s.replace(/(?<!\[)\[SKILL\]\]/g, '[[SKILL]]')
  s = s.replace(/(?<!\[)\[COMPANY\]\]/g, '[[COMPANY]]')
  s = s.replace(/(?<!\[)\[\/NAME\]\]/g, '[[/NAME]]')
  s = s.replace(/(?<!\[)\[\/SKILL\]\]/g, '[[/SKILL]]')
  s = s.replace(/(?<!\[)\[\/COMPANY\]\]/g, '[[/COMPANY]]')

  // Mentor bio bullets: first letter after ":" dropped (Role:oordinator, Areas:is, …)
  s = s.replace(/\bRole:oordinator\b/gi, 'Role: Coordinator')
  s = s.replace(/\bTechnical Areas:is\b/gi, 'Technical Areas: His')
  s = s.replace(/\bContribution:is\b/gi, 'Contribution: His')
  s = s.replace(/\bBackground:is\b/gi, 'Background: His')

  // "Coordinator at" merged / truncated
  s = s.replace(/\bCoordinatort\b/g, 'Coordinator at')

  return s
}
