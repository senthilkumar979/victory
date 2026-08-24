import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { sendAwardWinnerNotificationEmail } from './sendAwardWinnerNotificationEmail'

describe('sendAwardWinnerNotificationEmail', () => {
  const fetchMock = vi.fn()

  beforeEach(() => {
    fetchMock.mockReset()
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('trims the recipient email and posts JSON to the award-winner endpoint', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'email_1' }),
    })

    await sendAwardWinnerNotificationEmail({
      recipientEmail: '  winner@example.com  ',
      awardWinnerDisplayName: 'Ada',
      awardCategoryName: 'Excellence',
    })

    expect(fetchMock).toHaveBeenCalledWith('/api/email/send-award-winner', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipientEmail: 'winner@example.com',
        awardWinnerDisplayName: 'Ada',
        awardCategoryName: 'Excellence',
      }),
    })
  })

  it('throws the API error string when the request fails', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Award winner template not configured' }),
    })

    await expect(
      sendAwardWinnerNotificationEmail({
        recipientEmail: 'winner@example.com',
        awardWinnerDisplayName: 'Ada',
        awardCategoryName: 'Excellence',
      }),
    ).rejects.toThrow('Award winner template not configured')
  })

  it('throws a generic message when the failure body has no error string', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      json: async () => ({}),
    })

    await expect(
      sendAwardWinnerNotificationEmail({
        recipientEmail: 'winner@example.com',
        awardWinnerDisplayName: 'Ada',
        awardCategoryName: 'Excellence',
      }),
    ).rejects.toThrow('Failed to send award notification email')
  })
})
