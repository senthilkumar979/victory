export interface ButtonTheme {
  primary: string;
  secondary: string;
  text: string;
  tertiary: string;
  primaryOutline: string;
  error: string;
  secondaryOutline: string;
  textOutline: string;
  tertiaryOutline: string;
  errorOutline: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  textError: string;
  info: string;
  textInfo: string;
  textSuccess: string;
  textWarning: string;
}

export type BadgeColor =
  | "primary"
  | "secondary"
  | "tertiary"
  | "text"
  | "success"
  | "error"
  | "warning"
  | "info";

export type BadgeVariant = "solid" | "outline" | "ghost";

export type BadgeTheme = Record<BadgeColor, Record<BadgeVariant, string>>;

export type AlertColor =
  | "primary"
  | "secondary"
  | "tertiary"
  | "success"
  | "warning"
  | "info"
  | "error";

export type AlertTheme = Record<AlertColor, string>;

export interface Theme {
  button: ButtonTheme;
  badge: BadgeTheme;
  alert: AlertTheme;
}

export const defaultTheme: Theme = {
  button: {
    primary:
      "bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-primary",
    secondary:
      "bg-secondary text-secondary-foreground hover:bg-secondary/90 focus-visible:ring-secondary",
    text:
      "bg-transparent text-primary hover:bg-primary hover:text-white focus-visible:ring-primary",
    tertiary:
      "bg-muted text-muted-foreground hover:bg-muted/80 focus-visible:ring-muted",
    primaryOutline:
      "border border-primary text-primary bg-transparent hover:bg-primary hover:text-white focus-visible:ring-primary",
    secondaryOutline:
      "border border-secondary text-secondary bg-transparent hover:bg-secondary hover:text-white focus-visible:ring-secondary",
    textOutline:
      "border border-transparent text-primary bg-transparent hover:border-primary focus-visible:ring-primary",
    tertiaryOutline:
      "border border-muted text-muted-foreground bg-transparent hover:bg-muted text-black focus-visible:ring-muted",
    error:
      "bg-red-500 hover:bg-red-500/90 focus-visible:ring-red-500",
    errorOutline:
      "border border-red-500 text-red-500-foreground bg-transparent hover:bg-red-500 hover:text-white focus-visible:ring-red-500",
    textPrimary:
      "bg-transparent text-primary hover:bg-primary hover:text-white focus-visible:ring-primary",
    textSecondary:
      "bg-transparent text-secondary hover:bg-secondary hover:text-white focus-visible:ring-secondary",
    textTertiary:
      "bg-transparent text-muted-foreground hover:bg-muted-foreground hover:text-white focus-visible:ring-muted-foreground",
    textError:
      "bg-transparent text-red-500 hover:bg-red-500 hover:text-white focus-visible:ring-red-500",
    info:
      "bg-info text-info-foreground hover:bg-info hover:text-white focus-visible:ring-info",
    textInfo:
      "bg-transparent text-info hover:bg-info hover:text-white focus-visible:ring-info",
    textSuccess:
      "bg-transparent text-success hover:bg-success hover:text-white focus-visible:ring-success",
    textWarning:
      "bg-transparent text-warning hover:bg-warning hover:text-white focus-visible:ring-warning",
  },
  badge: {
    primary: {
      solid:
        "bg-primary text-primary-foreground border border-primary/70 shadow-sm",
      outline:
        "border border-primary text-primary bg-transparent shadow-sm bg-primary/5",
      ghost: "bg-transparent text-primary border border-transparent",
    },
    secondary: {
      solid:
        "bg-secondary text-secondary-foreground border border-secondary/70 shadow-sm",
      outline:
        "border border-secondary text-secondary bg-transparent shadow-sm bg-secondary/10",
      ghost: "bg-transparent text-secondary border border-transparent",
    },
    tertiary: {
      solid:
        "bg-muted text-muted-foreground border border-muted-foreground/40 shadow-sm",
      outline:
        "border border-muted-foreground/60 text-muted-foreground bg-transparent bg-muted/10",
      ghost: "bg-transparent text-muted-foreground border border-transparent",
    },
    text: {
      solid:
        "bg-transparent text-primary border border-primary/30 bg-primary/5",
      outline: "border border-primary text-primary bg-transparent",
      ghost: "bg-transparent text-primary border border-transparent",
    },
    success: {
      solid:
        "bg-success text-success-foreground border border-success/70 shadow-sm",
      outline:
        "border border-success text-success bg-transparent shadow-sm bg-success/10",
      ghost: "bg-transparent text-success border border-transparent",
    },
    error: {
      solid
        : "bg-red-500 text-red-500-foreground border border-red-500/70 shadow-sm",
      outline:
        "border border-red-500 text-red-500-foreground bg-transparent shadow-sm bg-red-500/10",
      ghost: "bg-transparent text-red-500-foreground border border-transparent",
    },
    warning: {
      solid:
        "bg-warning text-warning-foreground border border-warning/70 shadow-sm",
      outline:
        "border border-warning text-warning bg-transparent",
      ghost: "bg-transparent text-warning border border-transparent",
    },
    info: {
      solid: "bg-info text-info-foreground border border-info/70 shadow-sm",
      outline:
        "border border-info text-info bg-transparent shadow-sm bg-info/10",
      ghost: "bg-transparent text-info border border-transparent",
    },
  },
  alert: {
    primary: "border border-primary/40 bg-primary/5 text-primary",
    secondary: "border border-secondary/40 bg-secondary/5 text-secondary",
    tertiary: "border border-muted/50 bg-muted/5 text-muted-foreground",
    success: "border border-success/40 bg-success/5 text-success",
    warning: "border border-warning/50 text-warning",
    info: "border border-info/40 bg-info/5 text-info",
    error: "border border-error/40 bg-error/5 text-error",
  },
};

