import type { HTMLAttributes, ReactNode } from "react";
import {
  defaultTheme,
  type BadgeColor,
  type BadgeVariant,
  type Theme,
} from "@/core/theme/theme";

export type BadgeSize = "sm" | "md";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children?: ReactNode;
  color?: BadgeColor;
  variant?: BadgeVariant;
  size?: BadgeSize;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  theme?: Theme;
}

const badgeSizeClasses: Record<BadgeSize, string> = {
  sm: "px-2 py-0.5 text-xs gap-1",
  md: "px-2.5 py-0.5 text-sm gap-1.5",
};

const baseBadgeClass =
  "inline-flex items-center rounded-full font-medium tracking-tight " +
  "border bg-opacity-90 backdrop-blur-sm";

const mergeClasses = (...classes: Array<string | undefined>): string =>
  classes.filter(Boolean).join(" ");

const getBadgeClasses = (
  color: BadgeColor,
  variant: BadgeVariant,
  theme: Theme,
): string => {
  const badgeThemeForColor = theme.badge[color];
  return badgeThemeForColor[variant];
};

export const Badge = ({
  children,
  color = "primary",
  variant = "solid",
  size = "md",
  startIcon,
  endIcon,
  theme = defaultTheme,
  className,
  ...props
}: BadgeProps) => {
  const variantClass = getBadgeClasses(color, variant, theme);
  const sizeClass = badgeSizeClasses[size];

  return (
    <span
      className={mergeClasses(baseBadgeClass, variantClass, sizeClass, className)}
      {...props}
    >
      {startIcon ? <span className="inline-flex items-center">{startIcon}</span> : null}
      {children}
      {endIcon ? <span className="inline-flex items-center">{endIcon}</span> : null}
    </span>
  );
};

