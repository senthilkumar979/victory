import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { STUDENT_PUBLIC_SELECT } from '@/lib/studentSelectColumns'

import ProfilePage from './page'

const {
  errorToast,
  fetchMock,
  fromMock,
  incrementCount,
  limitState,
  useUserMock,
} = vi.hoisted(() => ({
  errorToast: vi.fn(),
  fetchMock: vi.fn(),
  fromMock: vi.fn(),
  incrementCount: vi.fn(),
  limitState: { canGenerate: true, remaining: 2 },
  useUserMock: vi.fn(),
}))

vi.mock('@clerk/nextjs', () => ({
  useUser: useUserMock,
}))

vi.mock('@/hooks/useCheckIsAuthenticated', () => ({
  useCheckIsAuthenticated: vi.fn(),
}))

vi.mock('@/hooks/useSelfIntroLimit', () => ({
  useSelfIntroLimit: () => ({
    canGenerate: limitState.canGenerate,
    remaining: limitState.remaining,
    incrementCount,
  }),
}))

vi.mock('@/lib/supabaseClient', () => ({
  supabase: { from: fromMock },
}))

vi.mock('goey-toast', () => ({
  gooeyToast: { error: errorToast, success: vi.fn() },
}))

vi.mock('@/app/profile/[id]/edit/ProfileEditForm', () => ({
  ProfileEditForm: ({
    email,
    studentId,
    onSaveSuccess,
    onBack,
  }: {
    email: string | null
    studentId: string
    onSaveSuccess: () => void
    onBack: () => void
  }) => (
    <div>
      <p>edit-mode</p>
      <p>email:{email ?? 'none'}</p>
      <p>student-id:{studentId || 'none'}</p>
      <button type="button" onClick={() => void onSaveSuccess()}>
        Save profile
      </button>
      <button type="button" onClick={onBack}>
        Back to profile
      </button>
    </div>
  ),
}))

vi.mock('@/components/profile/StudentProfileView', () => ({
  StudentProfileView: ({
    student,
  }: {
    student: { name: string; selfIntro?: string }
  }) => (
    <div>
      <p>{student.name}</p>
      <p>{student.selfIntro ? `intro:${student.selfIntro}` : 'no-intro'}</p>
    </div>
  ),
}))

vi.mock('@/ui/organisms/drawer/Drawer', () => {
  function DrawerTitle({ children }: { children: ReactNode }) {
    return <h2>{children}</h2>
  }

  function DrawerBody({ children }: { children: ReactNode }) {
    return <div>{children}</div>
  }

  function Drawer({
    isOpen,
    children,
  }: {
    isOpen: boolean
    children: ReactNode
  }) {
    if (!isOpen) return null
    return <section aria-label="Self introduction drawer">{children}</section>
  }

  Drawer.Title = DrawerTitle
  Drawer.Body = DrawerBody
  return { Drawer }
})

interface QueryMock {
  select: ReturnType<typeof vi.fn>
  eq: ReturnType<typeof vi.fn>
  maybeSingle: ReturnType<typeof vi.fn>
  update: ReturnType<typeof vi.fn>
  updateEq: ReturnType<typeof vi.fn>
}

function mockStudentQuery(): QueryMock {
  const query = {
    select: vi.fn(),
    eq: vi.fn(),
    maybeSingle: vi.fn(),
    update: vi.fn(),
    updateEq: vi.fn().mockResolvedValue({ error: null }),
  }
  query.select.mockReturnValue(query)
  query.eq.mockReturnValue(query)
  query.update.mockReturnValue({ eq: query.updateEq })
  fromMock.mockReturnValue(query)
  return query
}

function mockUser(
  emailAddresses: { id: string; emailAddress: string }[] | null,
  primaryEmailAddressId = 'primary',
): void {
  useUserMock.mockReturnValue({
    user: emailAddresses
      ? { primaryEmailAddressId, emailAddresses }
      : null,
  })
}

const namedRow = {
  id: 'student-1',
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  picture: '',
  role: 'Engineer',
  batch: 4,
  serial_no: 7,
  self_intro: null,
}

describe('secured profile page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    limitState.canGenerate = true
    limitState.remaining = 2
    vi.stubGlobal('fetch', fetchMock)
    mockUser(null)
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('does not query or generate when the signed-in user has no email', async () => {
    const user = userEvent.setup()
    render(<ProfilePage />)

    await user.click(screen.getByRole('button', { name: /Generate Self Intro/ }))

    expect(fromMock).not.toHaveBeenCalled()
    expect(fetchMock).not.toHaveBeenCalled()
    expect(errorToast).toHaveBeenCalledWith(
      'Profile not loaded',
      expect.objectContaining({
        description: 'Please wait for your profile to load.',
      }),
    )
    expect(screen.queryByText('edit-mode')).not.toBeInTheDocument()
  })

  it('loads the profile by primary email without admin-only columns', async () => {
    mockUser(
      [
        { id: 'other', emailAddress: 'first@example.com' },
        { id: 'primary', emailAddress: 'ada@example.com' },
      ],
      'primary',
    )
    const query = mockStudentQuery()
    query.maybeSingle.mockResolvedValue({ data: namedRow, error: null })

    render(<ProfilePage />)

    expect(await screen.findByText('Ada Lovelace')).toBeInTheDocument()
    expect(query.select).toHaveBeenCalledWith(STUDENT_PUBLIC_SELECT)
    expect(STUDENT_PUBLIC_SELECT).not.toContain('father_guardian_details')
    expect(query.eq).toHaveBeenCalledWith('email', 'ada@example.com')
    expect(screen.getByRole('button', { name: /Generate Self Intro \(2 left\)/ })).toBeEnabled()
    expect(screen.queryByText('edit-mode')).not.toBeInTheDocument()
  })

  it('falls back to the first address when the primary id does not match', async () => {
    mockUser([{ id: 'first', emailAddress: 'first@example.com' }], 'missing')
    const query = mockStudentQuery()
    query.maybeSingle.mockResolvedValue({
      data: { ...namedRow, email: 'first@example.com' },
      error: null,
    })

    render(<ProfilePage />)

    expect(await screen.findByText('Ada Lovelace')).toBeInTheDocument()
    expect(query.eq).toHaveBeenCalledWith('email', 'first@example.com')
  })

  it('opens the editor when the row has no name or the query fails', async () => {
    mockUser([{ id: 'primary', emailAddress: 'ada@example.com' }])
    const query = mockStudentQuery()
    query.maybeSingle.mockResolvedValueOnce({
      data: { id: 'student-1', email: 'ada@example.com' },
      error: null,
    })

    const { unmount } = render(<ProfilePage />)

    expect(await screen.findByText('edit-mode')).toBeInTheDocument()
    expect(screen.getByText('student-id:none')).toBeInTheDocument()
    expect(screen.queryByText('Ada Lovelace')).not.toBeInTheDocument()
    unmount()

    query.maybeSingle.mockResolvedValueOnce({
      data: null,
      error: { message: 'db down' },
    })
    const failed = render(<ProfilePage />)
    expect(await screen.findByText('edit-mode')).toBeInTheDocument()
    failed.unmount()

    query.maybeSingle.mockRejectedValueOnce(new Error('network'))
    render(<ProfilePage />)
    expect(await screen.findByText('edit-mode')).toBeInTheDocument()
  })

  it('opens a saved self-intro without calling the generator', async () => {
    const user = userEvent.setup()
    mockUser([{ id: 'primary', emailAddress: 'ada@example.com' }])
    const query = mockStudentQuery()
    query.maybeSingle.mockResolvedValue({
      data: { ...namedRow, self_intro: 'Already written' },
      error: null,
    })

    render(<ProfilePage />)

    expect(await screen.findByText('intro:Already written')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Self Introduction' }))

    expect(screen.getByRole('region', { name: 'Self introduction drawer' })).toHaveTextContent(
      'Already written',
    )
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('disables generation once the daily limit is reached', async () => {
    mockUser([{ id: 'primary', emailAddress: 'ada@example.com' }])
    const query = mockStudentQuery()
    query.maybeSingle.mockResolvedValue({ data: namedRow, error: null })
    limitState.canGenerate = false
    limitState.remaining = 0

    render(<ProfilePage />)

    const button = await screen.findByRole('button', { name: 'Generate Self Intro' })
    expect(button).toBeDisabled()
    expect(button).not.toHaveTextContent('left')
  })

  it('persists a generated intro and ignores a second click while it is in flight', async () => {
    const user = userEvent.setup()
    mockUser([{ id: 'primary', emailAddress: 'ada@example.com' }])
    const query = mockStudentQuery()
    query.maybeSingle.mockResolvedValue({ data: namedRow, error: null })
    let resolveFetch: (value: unknown) => void = () => undefined
    fetchMock.mockReturnValue(
      new Promise((resolve) => {
        resolveFetch = resolve
      }),
    )

    render(<ProfilePage />)
    const button = await screen.findByRole('button', { name: /Generate Self Intro/ })
    await user.click(button)

    await waitFor(() => expect(button).toBeDisabled())
    await user.click(button)
    expect(fetchMock).toHaveBeenCalledTimes(1)

    resolveFetch({
      ok: true,
      json: async () => ({ selfIntro: 'Hello from Ada' }),
    })

    expect(await screen.findByText('intro:Hello from Ada')).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Self introduction drawer' })).toHaveTextContent(
      'Hello from Ada',
    )
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/generate-self-intro',
      expect.objectContaining({ method: 'POST' }),
    )
    const body = JSON.parse(String(fetchMock.mock.calls[0][1].body)) as { name: string }
    expect(body.name).toBe('Ada Lovelace')
    expect(incrementCount).toHaveBeenCalledTimes(1)
    expect(query.update).toHaveBeenCalledWith({ self_intro: 'Hello from Ada' })
    expect(query.updateEq).toHaveBeenCalledWith('id', 'student-1')
  })

  it('keeps the generated text visible when saving it to the profile fails', async () => {
    const user = userEvent.setup()
    mockUser([{ id: 'primary', emailAddress: 'ada@example.com' }])
    const query = mockStudentQuery()
    query.maybeSingle.mockResolvedValue({ data: namedRow, error: null })
    query.updateEq.mockResolvedValue({ error: { message: 'write failed' } })
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ selfIntro: 'Unsaved intro' }),
    })

    render(<ProfilePage />)
    await user.click(await screen.findByRole('button', { name: /Generate Self Intro/ }))

    expect(await screen.findByText('Unsaved intro')).toBeInTheDocument()
    expect(screen.getByText('no-intro')).toBeInTheDocument()
    expect(errorToast).toHaveBeenCalledWith(
      'Could not save to profile',
      expect.objectContaining({
        description: 'Self-intro was generated but not saved. Please try again.',
      }),
    )
  })

  it('does not count a failed generation against the daily limit', async () => {
    const user = userEvent.setup()
    mockUser([{ id: 'primary', emailAddress: 'ada@example.com' }])
    const query = mockStudentQuery()
    query.maybeSingle.mockResolvedValue({ data: namedRow, error: null })
    fetchMock.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Model overloaded' }),
    })

    render(<ProfilePage />)
    await user.click(await screen.findByRole('button', { name: /Generate Self Intro/ }))

    await waitFor(() =>
      expect(errorToast).toHaveBeenCalledWith(
        'Failed to generate self-intro',
        expect.objectContaining({ description: 'Model overloaded' }),
      ),
    )
    expect(incrementCount).not.toHaveBeenCalled()
    expect(query.update).not.toHaveBeenCalled()

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    })
    await user.click(screen.getByRole('button', { name: /Generate Self Intro/ }))
    await waitFor(() =>
      expect(errorToast).toHaveBeenCalledWith(
        'Failed to generate self-intro',
        expect.objectContaining({ description: 'No content generated' }),
      ),
    )

    fetchMock.mockRejectedValueOnce('boom')
    await user.click(screen.getByRole('button', { name: /Generate Self Intro/ }))
    await waitFor(() =>
      expect(errorToast).toHaveBeenCalledWith(
        'Failed to generate self-intro',
        expect.objectContaining({ description: 'Please try again.' }),
      ),
    )
    expect(incrementCount).not.toHaveBeenCalled()
  })

  it('refreshes the loaded student after save and ignores a nameless row', async () => {
    const user = userEvent.setup()
    mockUser([{ id: 'primary', emailAddress: 'ada@example.com' }])
    const query = mockStudentQuery()
    query.maybeSingle
      .mockResolvedValueOnce({ data: namedRow, error: null })
      .mockResolvedValueOnce({ data: { id: 'student-1' }, error: null })
      .mockResolvedValueOnce({
        data: { ...namedRow, name: 'Ada King' },
        error: null,
      })

    render(<ProfilePage />)
    await user.click(await screen.findByRole('button', { name: 'Edit Profile' }))
    expect(screen.getByText('student-id:student-1')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Save profile' }))
    await waitFor(() => expect(query.maybeSingle).toHaveBeenCalledTimes(2))
    expect(screen.getByText('student-id:student-1')).toBeInTheDocument()
    expect(screen.getByText('edit-mode')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Save profile' }))
    await user.click(screen.getByRole('button', { name: 'Back to profile' }))

    expect(await screen.findByText('Ada King')).toBeInTheDocument()
  })
})
