import { describe, expect, it } from 'vitest'

import { shouldDropBrowserSentryEvent } from './shouldDropBrowserEvent'

describe('shouldDropBrowserSentryEvent', () => {
  it('drops Contentsquare script frames regardless of message', () => {
    expect(
      shouldDropBrowserSentryEvent({
        exception: {
          values: [
            {
              type: 'Error',
              value: 'boom',
              stacktrace: {
                frames: [
                  {
                    filename:
                      'https://t.contentsquare.net/uxa/5027a5ad08b17.js',
                    in_app: false,
                  },
                ],
              },
            },
          ],
        },
      }),
    ).toBe(true)
  })

  it('drops Location ReferenceErrors with no stack (cross-origin scripts)', () => {
    expect(
      shouldDropBrowserSentryEvent({
        exception: {
          values: [
            {
              type: 'ReferenceError',
              value: 'Location is not defined',
            },
          ],
        },
      }),
    ).toBe(true)
  })

  it('drops Location ReferenceErrors that only have third-party frames', () => {
    expect(
      shouldDropBrowserSentryEvent({
        culprit: 'https://t.contentsquare.net/uxa/5027a5ad08b17.js',
        exception: {
          values: [
            {
              type: 'ReferenceError',
              value: 'Location is not defined',
              stacktrace: {
                frames: [
                  {
                    filename:
                      'https://t.contentsquare.net/uxa/5027a5ad08b17.js',
                    in_app: false,
                  },
                ],
              },
            },
          ],
        },
      }),
    ).toBe(true)
  })

  it('keeps Location ReferenceErrors that include an in-app frame', () => {
    expect(
      shouldDropBrowserSentryEvent({
        exception: {
          values: [
            {
              type: 'ReferenceError',
              value: 'Location is not defined',
              stacktrace: {
                frames: [
                  {
                    filename: 'https://www.mentorbridge.in/_next/static/app.js',
                    in_app: true,
                  },
                ],
              },
            },
          ],
        },
      }),
    ).toBe(false)
  })

  it('keeps unrelated first-party errors', () => {
    expect(
      shouldDropBrowserSentryEvent({
        exception: {
          values: [
            {
              type: 'TypeError',
              value: 'j?.trim is not a function',
              stacktrace: {
                frames: [
                  {
                    filename: 'https://www.mentorbridge.in/_next/static/app.js',
                    in_app: true,
                  },
                ],
              },
            },
          ],
        },
      }),
    ).toBe(false)
  })
})
