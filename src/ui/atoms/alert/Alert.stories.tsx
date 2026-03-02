import type { AlertColor } from "@/core/theme/theme";
import type { Meta, StoryObj } from "@storybook/react";
import { Alert } from "./Alert";

const meta: Meta<typeof Alert> = {
  title: "Atoms/Alert",
  component: Alert,
  argTypes: {
    color: {
      control: "select",
      options: [
        "primary",
        "secondary",
        "tertiary",
        "success",
        "warning",
        "info",
        "error",
      ] satisfies AlertColor[],
    },
    startIcon: { control: false },
    title: { control: "text" },
    message: { control: "text" },
  },
  args: {
    color: "primary",
    title: "Alert title",
    message: "This is an alert message providing more details.",
  },
};

export default meta;

type Story = StoryObj<typeof Alert>;

const DotIcon = () => (
  <span className="inline-block h-2 w-2 rounded-full bg-current" />
);

export const Playground: Story = {
  render: (args) => <Alert {...args} />,
};

export const WithStartIcon: Story = {
  args: {
    color: "primary",
    title: "Alert with icon",
    message: "This alert shows a small leading status icon.",
    startIcon: <DotIcon />,
  },
};

export const Primary: Story = {
  args: {
    color: "primary",
    title: "Primary alert",
  },
};

export const Secondary: Story = {
  args: {
    color: "secondary",
    title: "Secondary alert",
  },
};

export const Tertiary: Story = {
  args: {
    color: "tertiary",
    title: "Tertiary alert",
  },
};

export const Success: Story = {
  args: {
    color: "success",
    title: "Success alert",
  },
};

export const Warning: Story = {
  args: {
    color: "warning",
    title: "Warning alert",
  },
};

export const Info: Story = {
  args: {
    color: "info",
    title: "Info alert",
  },
};

export const Error: Story = {
  args: {
    color: "error",
    title: "Error alert",
  },
};

