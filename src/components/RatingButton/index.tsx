import { Button } from "@stellar-ui-kit/web";
import { cn } from "@stellar-ui-kit/shared";

type RatingButtonProps = {
  label: string;
  interval: string;
  shortcut: string;
  onClick: () => void;
  bgColor?: "error" | "warning" | "primary" | "success";
};

export function RatingButton({
  label,
  interval,
  shortcut,
  onClick,
  bgColor = "primary",
}: RatingButtonProps) {
  return (
    <Button
      type="button"
      onClick={onClick}
      className={cn(
        "flex h-auto flex-col items-center gap-0.5 px-4 py-2",
        bgColor === "error" && "bg-error-soft text-error-text",
        bgColor === "warning" && "bg-warning-soft text-warning-text",
        bgColor === "primary" && "bg-primary-soft text-primary-text",
        bgColor === "success" && "bg-success-soft text-success-text",
      )}
    >
      <span className="text-xs font-thin">[{shortcut}]</span>
      <span className="font-semibold">{label}</span>
      <span className="text-xs font-thin">{interval}</span>
    </Button>
  );
}
