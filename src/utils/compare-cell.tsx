import { cn } from "@stellar-ui-kit/shared";
import { Check, Minus } from "lucide-react";

type CompareCellProps = {
  value: string;
  onSoft?: boolean;
};

export function CompareCell({ value, onSoft = false }: CompareCellProps) {
  const textColor = onSoft ? "text-primary-text" : "text-foreground";

  if (value === "check") {
    return (
      <span className="inline-flex items-center justify-center">
        <Check className={cn("size-4", onSoft ? "text-primary-text" : "text-success")} />
      </span>
    );
  }

  if (value === "no") {
    return (
      <span className="inline-flex items-center justify-center">
        <Minus className="size-4 text-muted" />
      </span>
    );
  }

  if (value === "partial") {
    return (
      <span className="inline-flex items-center justify-center text-sm text-warning">
        ~
      </span>
    );
  }

  return <span className={cn("text-xs", textColor)}>{value}</span>;
}
