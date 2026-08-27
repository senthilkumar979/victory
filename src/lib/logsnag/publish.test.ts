import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const trackMock = vi.fn()
const constructorMock = vi.fn()

vi.mock('server-only', () => ({}))

vi.mock('logsnag', () => ({
  LogSnag: function LogSnag(this: { track: typeof trackMock }, options: unknown) {
    constructorMock(options)
    this.track = trackMock
  },
}))

describe('publishLogSnagEvent', () => {
  beforeEach(() => {
    vi.resetModules()
    trackMock.mockReset()
    constructorMock.mockReset()
    delete process.env.LOGSNAG_API_TOKEN
    delete process.env.LOGSNAG_PROJECT
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('skips publishing when token or project is missing or whitespace', async () => {
    const { publishLogSnagEvent } = await import('./publish')

    await expect(
      publishLogSnagEvent({ channel: 'web', event: 'Page view' }),
    ).resolves.toEqual({ ok: false, skipped: true })

    vi.stubEnv('LOGSNAG_API_TOKEN', '   ')
    vi.stubEnv('LOGSNAG_PROJECT', 'victory')
    vi.resetModules()
    const { publishLogSnagEvent: publishWithBlankToken } = await import('./publish')

    await expect(
      publishWithBlankToken({ channel: 'web', event: 'Page view' }),
    ).resolves.toEqual({ ok: false, skipped: true })
    expect(constructorMock).not.toHaveBeenCalled()
    expect(trackMock).not.toHaveBeenCalled()
  })

  it('tracks the event when LogSnag is configured', async () => {
    vi.stubEnv('LOGSNAG_API_TOKEN', 'token-123')
    vi.stubEnv('LOGSNAG_PROJECT', 'victory')
    trackMock.mockResolvedValue(undefined)

    const { publishLogSnagEvent } = await import('./publish')
    const payload = { channel: 'web', event: 'Page view' }

    await expect(publishLogSnagEvent(payload)).resolves.toEqual({ ok: true })
    expect(constructorMock).toHaveBeenCalledWith({
      token: 'token-123',
      project: 'victory',
    })
    expect(trackMock).toHaveBeenCalledWith(payload)
  })

  it('maps thrown errors without crashing the caller', async () => {
    vi.stubEnv('LOGSNAG_API_TOKEN', 'token-123')
    vi.stubEnv('LOGSNAG_PROJECT', 'victory')
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    trackMock.mockRejectedValueOnce(new Error('rate limited'))

    const { publishLogSnagEvent } = await import('./publish')

    await expect(
      publishLogSnagEvent({ channel: 'web', event: 'Page view' }),
    ).resolves.toEqual({ ok: false, error: 'rate limited' })

    trackMock.mockRejectedValueOnce('boom')
    await expect(
      publishLogSnagEvent({ channel: 'web', event: 'Page view' }),
    ).resolves.toEqual({ ok: false, error: 'LogSnag publish failed' })

    expect(consoleError).toHaveBeenCalled()
    consoleError.mockRestore()
  })
})
