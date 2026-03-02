export interface ButtonTheme {
  primary: string;
  secondary: string;
  text: string;
  tertiary: string;
  primaryOutline: string;
  secondaryOutline: string;
  textOutline: string;
  tertiaryOutline: string;
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

export interface Theme {
  button: ButtonTheme;
  badge: BadgeTheme;
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
      solid: "bg-error text-error-foreground border border-error/70 shadow-sm",
      outline:
        "border border-error text-error bg-transparent shadow-sm bg-error/10",
      ghost: "bg-transparent text-error border border-transparent",
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
};

