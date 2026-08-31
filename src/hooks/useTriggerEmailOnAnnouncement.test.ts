import { act, cleanup, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { RESEND_TEMPLATE_IDS } from '@/constants/ThirdPartyConstants'

import { useTriggerEmailOnAnnouncement } from './useTriggerEmailOnAnnouncement'

const { sendEmailMock, useGoogleGroupsMock } = vi.hoisted(() => ({
  sendEmailMock: vi.fn(),
  useGoogleGroupsMock: vi.fn(),
}))

vi.mock('./useSendEmailWithTemplate', () => ({
  useSendEmailWithTemplate: () => ({ sendEmail: sendEmailMock }),
}))

vi.mock('./useGoogleGroups', () => ({
  useGoogleGroups: () => useGoogleGroupsMock(),
}))

afterEach(() => {
  cleanup()
})

describe('useTriggerEmailOnAnnouncement', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    sendEmailMock.mockResolvedValue(undefined)
    useGoogleGroupsMock.mockReturnValue({
      groups: [
        { id: 'g1', name: 'Cohort A', email: 'a@groups.example' },
        { id: 'g2', name: 'Alumni', email: 'alumni@groups.example' },
      ],
    })
  })

  it('sends the announcement template to every group email', async () => {
    const { result } = renderHook(() => useTriggerEmailOnAnnouncement())

    await act(async () => {
      await result.current.triggerEmailOnAnnouncement({
        title: 'Campus closed',
        description: 'No session tomorrow',
      })
    })

    expect(sendEmailMock).toHaveBeenCalledWith({
      to: ['a@groups.example', 'alumni@groups.example'],
      templateId: RESEND_TEMPLATE_IDS.ANNOUNCEMENT,
      variables: {
        subject: 'Campus closed',
        announcement: 'No session tomorrow',
      },
    })
  })

  it('sends to an empty recipient list when no groups are loaded', async () => {
    useGoogleGroupsMock.mockReturnValue({ groups: [] })
    const { result } = renderHook(() => useTriggerEmailOnAnnouncement())

    await act(async () => {
      await result.current.triggerEmailOnAnnouncement({
        title: 'Ping',
        description: 'Hello',
      })
    })

    expect(sendEmailMock).toHaveBeenCalledWith(
      expect.objectContaining({ to: [] }),
    )
  })

  it('rethrows send failures after logging them', async () => {
    const error = new Error('Resend down')
    sendEmailMock.mockRejectedValue(error)
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    const { result } = renderHook(() => useTriggerEmailOnAnnouncement())

    await expect(
      act(async () => {
        await result.current.triggerEmailOnAnnouncement({
          title: 'Campus closed',
          description: 'No session tomorrow',
        })
      }),
    ).rejects.toThrow('Resend down')

    expect(consoleError).toHaveBeenCalled()
    consoleError.mockRestore()
  })
})
