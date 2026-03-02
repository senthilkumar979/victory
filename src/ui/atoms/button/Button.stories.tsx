import type { Meta, StoryObj } from "@storybook/react";
import {
  Button,
  PrimaryButton,
  SecondaryButton,
  TertiaryButton,
  TextButton,
  type ButtonMode,
  type ButtonSize,
  type ButtonVariant,
} from "./Button";

const meta: Meta<typeof Button> = {
  title: "Atoms/Button",
  component: Button,
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "text", "tertiary"] satisfies ButtonVariant[],
    },
    mode: {
      control: "select",
      options: ["solid", "outline"] satisfies ButtonMode[],
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"] satisfies ButtonSize[],
    },
    disabled: {
      control: "boolean",
    },
  },
  args: {
    children: "Button",
    variant: "primary",
    size: "md",
    mode: "solid",
    disabled: false,
  },
};

export default meta;

type Story = StoryObj<typeof Button>;

export const Playground: Story = {
  render: ({ children, disabled, ...rest }) => (
    <Button {...rest} disabled={disabled}>
      {children}
    </Button>
  ),
};

export const Primary: Story = {
  args: {
    children: "Primary",
    variant: "primary",
  },
};

export const Secondary: Story = {
  args: {
    children: "Secondary",
    variant: "secondary",
  },
};

export const Text: Story = {
  args: {
    children: "Text",
    variant: "text",
  },
};

export const Tertiary: Story = {
  args: {
    children: "Tertiary",
    variant: "tertiary",
  },
};

export const OutlinePrimary: Story = {
  args: {
    children: "Outline primary",
    variant: "primary",
    mode: "outline",
  },
};

export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: "flex", gap: 12 }}>
      <PrimaryButton {...args} size="sm">
        Small
      </PrimaryButton>
      <PrimaryButton {...args} size="md">
        Medium
      </PrimaryButton>
      <PrimaryButton {...args} size="lg">
        Large
      </PrimaryButton>
    </div>
  ),
};
