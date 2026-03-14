import { Card, Text } from "@stellar-ui-kit/web";
import { cn } from "@stellar-ui-kit/shared";

type StatCardProps = {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  iconBg: string;
  iconColor: string;
  className?: string;
};

export function StatCard({
  icon,
  label,
  value,
  iconBg,
  iconColor,
  className,
}: StatCardProps) {
  return (
    <Card
      className={cn(
        "flex flex-col gap-3 border border-border bg-surface p-5 transition-colors hover:border-border/80",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex size-10 items-center justify-center rounded-lg",
            iconBg,
            iconColor,
          )}
        >
          {icon}
        </div>

        <div className="flex flex-1 flex-col gap-0.5">
          <Text as="span" styleVariant="muted" className="text-xs font-medium">
            {label}
          </Text>
          <Text as="span" className="text-2xl font-semibold tabular-nums">
            {value}
          </Text>
        </div>
      </div>
    </Card>
  );
}
