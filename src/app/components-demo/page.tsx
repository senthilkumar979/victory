import {
  PrimaryButton,
  SecondaryButton,
  TertiaryButton,
  TextButton,
} from "@/ui/atoms/button/Button";
import { Badge } from "@/ui/atoms/badge/Badge";

const ComponentsDemoPage = () => {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 bg-foreground px-6">
      <h1 className="text-2xl font-semibold text-foreground">Components demo</h1>
      <div className="flex flex-wrap items-center justify-center gap-4">
        <PrimaryButton>Primary</PrimaryButton>
        <SecondaryButton>Secondary</SecondaryButton>
        <TextButton>Text</TextButton>
        <TertiaryButton>Tertiary</TertiaryButton>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-4">
        <PrimaryButton mode="outline">Primary outline</PrimaryButton>
        <SecondaryButton mode="outline">Secondary outline</SecondaryButton>
        <TextButton mode="outline">Text outline</TextButton>
        <TertiaryButton mode="outline">Tertiary outline</TertiaryButton>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-4">
        <PrimaryButton size="sm">Primary sm</PrimaryButton>
        <PrimaryButton size="md">Primary md</PrimaryButton>
        <PrimaryButton size="lg">Primary lg</PrimaryButton>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-4">
        <PrimaryButton disabled>Disabled primary</PrimaryButton>
        <TextButton disabled>Disabled text</TextButton>
      </div>
      <section className="flex flex-col items-center gap-4">
        <h2 className="text-lg font-semibold text-foreground">Badges</h2>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Badge>Primary solid</Badge>
          <Badge color="primary" variant="outline">
            Primary outline
          </Badge>
          <Badge color="primary" variant="ghost">
            Primary ghost
          </Badge>
          <Badge color="secondary">Secondary solid</Badge>
          <Badge color="secondary" variant="outline">
            Secondary outline
          </Badge>
          <Badge color="secondary" variant="ghost">
            Secondary ghost
          </Badge>
          <Badge color="success">Success solid</Badge>
          <Badge color="success" variant="outline">
            Success outline
          </Badge>
          <Badge color="success" variant="ghost">
            Success ghost
          </Badge>
          <Badge color="error">Error solid</Badge>
          <Badge color="error" variant="outline">
            Error outline
          </Badge>
          <Badge color="error" variant="ghost">
            Error ghost
          </Badge>
          <Badge color="warning">Warning solid</Badge>
          <Badge color="warning" variant="outline">
            Warning outline
          </Badge>
          <Badge color="warning" variant="ghost">
            Warning ghost
          </Badge>
          <Badge color="info">Info solid</Badge>
          <Badge color="info" variant="outline">
            Info outline
          </Badge>
          <Badge color="info" variant="ghost">
            Info ghost
          </Badge>
          <Badge
            color="tertiary"
            variant="solid"
            startIcon={
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
            }
            endIcon={<span className="text-xs">●</span>}
          >
            With icons
          </Badge>
        </div>
      </section>
    </main>
  );
};

export default ComponentsDemoPage;

