import type { ButtonHTMLAttributes, ReactNode } from "react";
import { defaultTheme, type Theme } from "@/core/theme/theme";

export type ButtonVariant = "primary" | "secondary" | "text" | "tertiary";
export type ButtonMode = "solid" | "outline";
export type ButtonSize = "sm" | "md" | "lg";

interface ButtonBaseProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  children?: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  mode?: ButtonMode;
  theme?: Theme;
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-2.5 text-base",
};

const mergeClasses = (...classes: Array<string | undefined>): string =>
  classes.filter(Boolean).join(" ");

const getVariantClasses = (
  variant: ButtonVariant,
  mode: ButtonMode,
  theme: Theme,
): string => {
  const { button } = theme;

  if (variant === "secondary") {
    return mode === "outline" ? button.secondaryOutline : button.secondary;
  }

  if (variant === "text") {
    return mode === "outline" ? button.textOutline : button.text;
  }

  if (variant === "tertiary") {
    return mode === "outline" ? button.tertiaryOutline : button.tertiary;
  }

  if (mode === "outline") return button.primaryOutline;

  return button.primary;
};

export const Button = ({
  children,
  variant = "primary",
  size = "md",
  mode = "solid",
  theme = defaultTheme,
  className,
  type = "button",
  ...props
}: ButtonBaseProps) => {
  const variantClass = getVariantClasses(variant, mode, theme);
  const sizeClass = sizeClasses[size];

  const baseClass =
    "inline-flex items-center justify-center rounded-md font-medium transition-colors cursor-pointer" +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 " +
    "disabled:cursor-not-allowed disabled:opacity-60";

  return (
    <button
      type={type}
      className={mergeClasses(baseClass, variantClass, sizeClass, className)}
      {...props}
    >
      {children}
    </button>
  );
};

type VariantButtonProps = Omit<ButtonBaseProps, "variant">;

export const PrimaryButton = (props: VariantButtonProps) => (
  <Button {...props} variant="primary" />
);

export const SecondaryButton = (props: VariantButtonProps) => (
  <Button {...props} variant="secondary" />
);

export const TextButton = (props: VariantButtonProps) => (
  <Button {...props} variant="text" />
);

export const TertiaryButton = (props: VariantButtonProps) => (
  <Button {...props} variant="tertiary" />
);

