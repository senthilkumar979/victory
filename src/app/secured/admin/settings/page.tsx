'use client'

import { useCheckIsAuthenticated } from "../../../hooks/useCheckIsAuthenticated";
import { SettingsNav, type SettingsNavItem } from "./components/SettingsNav";

const AdminSettingsPage = () => {
  useCheckIsAuthenticated();

  const items: SettingsNavItem[] = [
    {
      value: "general",
      label: "General",
      content: (
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">General</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Manage high-level admin settings and defaults.
          </p>
        </div>
      ),
    },
    {
      value: "security",
      label: "Security",
      content: (
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Security</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Configure authentication, roles, and access controls.
          </p>
        </div>
      ),
    },
    {
      value: "users",
      label: "Users",
      content: (
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Users</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Manage admin users, invitations, and permissions.
          </p>
        </div>
      ),
    },
    {
      value: "billing",
      label: "Billing",
      disabled: true,
      content: (
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Billing</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Billing is not available in this environment.
          </p>
        </div>
      ),
    },
  ];

  return (
    <main className="min-h-screen px-6 py-10">
      <div className="mx-auto w-full max-w-8xl space-y-6">
        <header className="space-y-1">
          <h1 className="text-2xl font-semibold text-primary">Admin settings</h1>
          <p className="text-sm text-secondary">
            Choose a section from the left to edit its settings.
          </p>
        </header>

        <SettingsNav items={items} />
      </div>
    </main>
  );
};

export default AdminSettingsPage;

