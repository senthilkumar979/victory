import {
  defaultTheme,
  type AlertColor,
  type Theme,
} from "@/core/theme/theme";
import type { HTMLAttributes, ReactNode } from "react";

interface AlertProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  color?: AlertColor;
  startIcon?: ReactNode;
  title: ReactNode;
  message: ReactNode;
  theme?: Theme;
}

const baseAlertClass =
  "flex w-full items-start gap-3 rounded-md border px-3 py-2 text-sm";

const mergeClasses = (...classes: Array<string | undefined>): string =>
  classes.filter(Boolean).join(" ");

const getAlertClasses = (color: AlertColor, theme: Theme): string =>
  theme.alert[color];

export const Alert = ({
  color = "primary",
  startIcon,
  title,
  message,
  theme = defaultTheme,
  className,
  ...props
}: AlertProps) => {
  const colorClass = getAlertClasses(color, theme);

  return (
    <div
      className={mergeClasses(baseAlertClass, colorClass, className)}
      role="alert"
      {...props}
    >
      {startIcon ? (
        <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center">
          {startIcon}
        </div>
      ) : null}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="leading-snug font-bold">{title}</div>
        <div className="text-sm leading-snug font-normal">
          {message}
        </div>
      </div>
    </div>
  );
};

