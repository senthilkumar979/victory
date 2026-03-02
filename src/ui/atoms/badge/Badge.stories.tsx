import type { BadgeColor, BadgeVariant } from "@/core/theme/theme";
import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from "./Badge";

/**
 * Storybook configuration for Badge atom.
 */

const meta: Meta<typeof Badge> = {
  title: "Atoms/Badge",
  component: Badge,
  argTypes: {
    color: {
      control: "select",
      options: [
        "primary",
        "secondary",
        "tertiary",
        "text",
        "success",
        "error",
        "warning",
        "info",
      ] satisfies BadgeColor[],
    },
    variant: {
      control: "select",
      options: ["solid", "ghost", "outline"] satisfies BadgeVariant[],
    },
    size: {
      control: "inline-radio",
      options: ["sm", "md"],
    },
    startIcon: { control: false },
    endIcon: { control: false },
  },
  args: {
    children: "Badge",
    color: "primary",
    variant: "solid",
    size: "md",
  },
};

export default meta;

type Story = StoryObj<typeof Badge>;

const DotIcon = () => (
  <span className="inline-block h-1.5 w-1.5 rounded-full bg-current" />
);

// Playground story remains to allow free-form provides
export const Playground: Story = {
  render: ({ children, ...rest }) => (
    <Badge {...rest}>{children}</Badge>
  ),
};

export const WithStartEndIcons: Story = {
  args: {
    children: "With icons",
    color: "primary",
    variant: "solid",
    startIcon: <DotIcon />,
    endIcon: <DotIcon />,
  },
  render: ({ children, startIcon, endIcon, ...rest }) => (
    <Badge {...rest} startIcon={startIcon} endIcon={endIcon}>
      {children}
    </Badge>
  ),
};

// Cover all BadgeColor and BadgeVariant cases individually

// All color and solid
export const PrimarySolid: Story = {
  args: {
    children: "Primary solid",
    color: "primary",
    variant: "solid",
    size: "md",
  },
};
export const SecondarySolid: Story = {
  args: {
    children: "Secondary solid",
    color: "secondary",
    variant: "solid",
    size: "md",
  },
};
export const TertiarySolid: Story = {
  args: {
    children: "Tertiary solid",
    color: "tertiary",
    variant: "solid",
    size: "md",
  },
};
export const TextSolid: Story = {
  args: {
    children: "Text solid",
    color: "text",
    variant: "solid",
    size: "md",
  },
};
export const SuccessSolid: Story = {
  args: {
    children: "Success solid",
    color: "success",
    variant: "solid",
    size: "md",
  },
};
export const ErrorSolid: Story = {
  args: {
    children: "Error solid",
    color: "error",
    variant: "solid",
    size: "md",
  },
};
export const WarningSolid: Story = {
  args: {
    children: "Warning solid",
    color: "warning",
    variant: "solid",
    size: "md",
  },
};
export const InfoSolid: Story = {
  args: {
    children: "Info solid",
    color: "info",
    variant: "solid",
    size: "md",
  },
};

// All color and outline
export const PrimaryOutline: Story = {
  args: {
    children: "Primary outline",
    color: "primary",
    variant: "outline",
    size: "md",
  },
};
export const SecondaryOutline: Story = {
  args: {
    children: "Secondary outline",
    color: "secondary",
    variant: "outline",
    size: "md",
  },
};
export const TertiaryOutline: Story = {
  args: {
    children: "Tertiary outline",
    color: "tertiary",
    variant: "outline",
    size: "md",
  },
};
export const TextOutline: Story = {
  args: {
    children: "Text outline",
    color: "text",
    variant: "outline",
    size: "md",
  },
};
export const SuccessOutline: Story = {
  args: {
    children: "Success outline",
    color: "success",
    variant: "outline",
    size: "md",
  },
};
export const ErrorOutline: Story = {
  args: {
    children: "Error outline",
    color: "error",
    variant: "outline",
    size: "md",
  },
};
export const WarningOutline: Story = {
  args: {
    children: "Warning outline",
    color: "warning",
    variant: "outline",
    size: "md",
  },
};
export const InfoOutline: Story = {
  args: {
    children: "Info outline",
    color: "info",
    variant: "outline",
    size: "md",
  },
};

// All color and ghost
export const PrimaryGhost: Story = {
  args: {
    children: "Primary ghost",
    color: "primary",
    variant: "ghost",
    size: "md",
  },
};
export const SecondaryGhost: Story = {
  args: {
    children: "Secondary ghost",
    color: "secondary",
    variant: "ghost",
    size: "md",
  },
};
export const TertiaryGhost: Story = {
  args: {
    children: "Tertiary ghost",
    color: "tertiary",
    variant: "ghost",
    size: "md",
  },
};
export const TextGhost: Story = {
  args: {
    children: "Text ghost",
    color: "text",
    variant: "ghost",
    size: "md",
  },
};
export const SuccessGhost: Story = {
  args: {
    children: "Success ghost",
    color: "success",
    variant: "ghost",
    size: "md",
  },
};
export const ErrorGhost: Story = {
  args: {
    children: "Error ghost",
    color: "error",
    variant: "ghost",
    size: "md",
  },
};
export const WarningGhost: Story = {
  args: {
    children: "Warning ghost",
    color: "warning",
    variant: "ghost",
    size: "md",
  },
};
export const InfoGhost: Story = {
  args: {
    children: "Info ghost",
    color: "info",
    variant: "ghost",
    size: "md",
  },
};

// Example showing all sizes per color/variant, for compactness add for primary/solid only (expand as needed)
export const PrimarySolidSmall: Story = {
  args: {
    children: "Primary solid sm",
    color: "primary",
    variant: "solid",
    size: "sm",
  },
};
export const PrimarySolidMedium: Story = {
  args: {
    children: "Primary solid md",
    color: "primary",
    variant: "solid",
    size: "md",
  },
};

