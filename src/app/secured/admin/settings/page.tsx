'use client'

import { Title } from "@/templates/Title";
import { SubTitle } from "../../../../ui/templates/SubTitle";
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
          <SubTitle>General</SubTitle>
          <p className="text-sm text-gray-500">
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
          <SubTitle>Security</SubTitle>
          <p className="text-sm text-gray-500">
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
          <SubTitle>Users</SubTitle>
          <p className="text-sm text-gray-500">
            Manage admin users, invitations, and permissions.
          </p>
        </div>
      ),
    },
  ];

  return (
    <main className="min-h-screen px-6 py-10">
      <div className="mx-auto w-full max-w-8xl space-y-6">
        <header className="space-y-1">
          <Title as="h1" className="text-2xl font-semibold text-primary">Admin settings</Title>
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

