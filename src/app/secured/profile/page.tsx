'use client'

import { useCheckIsAuthenticated } from '../../hooks/useCheckIsAuthenticated'

const ProfilePage = () => {
  useCheckIsAuthenticated()
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 ">
      <div className="rounded-lg bg-white p-8 shadow-md dark:bg-zinc-900">
        <h1 className="mb-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Profile
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          This is the profile page for users.
        </p>
      </div>
    </main>
  )
}

export default ProfilePage
