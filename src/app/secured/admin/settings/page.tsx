'use client'

import { useCheckIsAuthenticated } from "../../../hooks/useCheckIsAuthenticated";

const AdminSettingsPage = () => {
  useCheckIsAuthenticated();
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
      <div className="rounded-lg bg-white p-8 shadow-md dark:bg-zinc-900">
        <h1 className="mb-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Admin settings
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          This is the admin settings page for administrators.
        </p>
      </div>
    </main>
  );
};

export default AdminSettingsPage;

