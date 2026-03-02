import {
  PrimaryButton,
  SecondaryButton,
  TertiaryButton,
  TextButton,
} from "@/ui/atoms/button/Button";

const ComponentsDemoPage = () => {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 bg-background px-6">
      <h1 className="text-2xl font-semibold text-foreground">
        Button component demo
      </h1>
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
    </main>
  );
};

export default ComponentsDemoPage;

