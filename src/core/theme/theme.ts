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

export interface Theme {
  button: ButtonTheme;
}

export const defaultTheme: Theme = {
  button: {
    primary:
      "bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-primary",
    secondary:
      "bg-secondary text-secondary-foreground hover:bg-secondary/90 focus-visible:ring-secondary",
    text:
      "bg-transparent text-primary hover:bg-muted focus-visible:ring-primary",
    tertiary:
      "bg-muted text-muted-foreground hover:bg-muted/80 focus-visible:ring-muted",
    primaryOutline:
      "border border-primary text-primary bg-transparent hover:bg-primary text-white focus-visible:ring-primary",
    secondaryOutline:
      "border border-secondary text-secondary bg-transparent hover:bg-secondary text-white focus-visible:ring-secondary",
    textOutline:
      "border border-transparent text-primary bg-transparent hover:border-muted focus-visible:ring-primary",
    tertiaryOutline:
      "border border-muted text-muted-foreground bg-transparent hover:bg-muted text-black focus-visible:ring-muted",
  },
};

