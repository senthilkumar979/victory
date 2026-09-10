interface SentryExceptionFrame {
  filename?: string
  in_app?: boolean
}

interface SentryExceptionValue {
  type?: string
  value?: string
  stacktrace?: { frames?: SentryExceptionFrame[] }
}

export interface DroppableSentryEvent {
  culprit?: string
  exception?: { values?: SentryExceptionValue[] }
}

const CONTENTSQUARE_URL_PATTERN = /contentsquare\.net|clicktale\.net/i
const LOCATION_NOT_DEFINED = 'Location is not defined'

function eventFilenames(event: DroppableSentryEvent): string[] {
  const frames =
    event.exception?.values?.flatMap(
      (value) => value.stacktrace?.frames ?? [],
    ) ?? []

  return [event.culprit, ...frames.map((frame) => frame.filename)].filter(
    (filename): filename is string => Boolean(filename),
  )
}

function isLocationNotDefinedReferenceError(
  event: DroppableSentryEvent,
): boolean {
  const exception = event.exception?.values?.[0]
  if (!exception) return false
  if (exception.type && exception.type !== 'ReferenceError') return false
  return exception.value === LOCATION_NOT_DEFINED
}

/**
 * Contentsquare's tag evaluates the DOM `Location` constructor as a DI token.
 * That throws in non-DOM runtimes; first-party bundles do not reference it.
 */
export function shouldDropBrowserSentryEvent(
  event: DroppableSentryEvent,
): boolean {
  const filenames = eventFilenames(event)
  if (filenames.some((filename) => CONTENTSQUARE_URL_PATTERN.test(filename))) {
    return true
  }

  if (!isLocationNotDefinedReferenceError(event)) return false

  const frames = event.exception?.values?.[0]?.stacktrace?.frames ?? []
  if (frames.length === 0) return true
  return !frames.some((frame) => frame.in_app)
}
