import { Card, Text } from "@stellar-ui-kit/web";

type SettingsSectionProps = {
  id?: string;
  title: string;
  children: React.ReactNode;
};

export function SettingsSection({ id, title, children }: SettingsSectionProps) {
  return (
    <section id={id} className="flex flex-col gap-2">
      <Text as="h2" className="text-sm font-semibold text-foreground">
        {title}
      </Text>

      <Card className="border border-border bg-surface p-4">
        <div className="flex w-full flex-col gap-3">{children}</div>
      </Card>
    </section>
  );
}
