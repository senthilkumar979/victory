/**
 * Fixes common model typos in visitor-chat replies so links and emails render correctly.
 */
export function normalizeVisitorChatText(text: string): string {
  let s = text
  // Missing leading "h" in https (models sometimes output ttps://)
  s = s.replace(/\bttps:\/\//gi, 'https://')
  s = s.replace(/\bttp:\/\//gi, 'http://')
  // Missing leading "m" in mail@mentorbridge.in
  s = s.replace(/\bail@mentorbridge\.in\b/gi, 'mail@mentorbridge.in')
  return s
}
