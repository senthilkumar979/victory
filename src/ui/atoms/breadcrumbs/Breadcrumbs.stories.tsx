import type { Meta, StoryObj } from "@storybook/react";
import { Breadcrumbs } from "./Breadcrumbs";

const meta: Meta<typeof Breadcrumbs> = {
  title: "Atoms/Breadcrumbs",
  component: Breadcrumbs,
  argTypes: {
    items: { control: false },
    separator: {
      control: "text",
    },
    ariaLabel: {
      control: "text",
    },
  },
};

export default meta;

type Story = StoryObj<typeof Breadcrumbs>;

export const Playground: Story = {
  args: {
    items: [
      { label: "Home", href: "/" },
      { label: "Projects", href: "/projects" },
      { label: "Victory UI" },
    ],
    separator: "/",
    ariaLabel: "Breadcrumb navigation",
  },
};

export const WithCustomSeparator: Story = {
  args: {
    items: [
      { label: "Home", href: "/" },
      { label: "Components", href: "/components" },
      { label: "Breadcrumbs" },
    ],
    separator: ">",
  },
};

export const LongBreadcrumbTrail: Story = {
  args: {
    items: [
      { label: "Home", href: "/" },
      { label: "Workbench", href: "/workbench" },
      { label: "Design System", href: "/workbench/design-system" },
      { label: "Navigation", href: "/workbench/design-system/navigation" },
      { label: "Breadcrumbs" },
    ],
  },
};

