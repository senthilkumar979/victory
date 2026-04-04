const SDK_OR_INTERNAL =
  /GoogleGenerativeAI|^\[GoogleGenerativeAI|@google\/generative|generative-ai|GenerativeModel/i

/** Shown for any error that should not expose technical or API-internal wording. */
export const VISITOR_CHAT_GENERIC_ERROR =
  'Something went wrong. Please try again, or refresh the page if it keeps happening.'

const OPAQUE_API_ERRORS =
  /invalid message payload|invalid json body|last message must be from the user|^request failed$/i

/** Keep specific, visitor-safe copy from the server as-is. */
const PASS_THROUGH = /^Chat is temporarily unavailable/i

export function sanitizeVisitorChatErrorMessage(raw: string | undefined): string {
  if (!raw) return VISITOR_CHAT_GENERIC_ERROR
  const t = raw.trim()
  if (PASS_THROUGH.test(t)) return t
  if (SDK_OR_INTERNAL.test(t)) return VISITOR_CHAT_GENERIC_ERROR
  if (OPAQUE_API_ERRORS.test(t)) return VISITOR_CHAT_GENERIC_ERROR
  return t
}
