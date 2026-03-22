import { cn } from "@stellar-ui-kit/shared";

type RatingButtonProps = {
  label: string;
  interval: string;
  shortcut: string;
  onClick: () => void;
  bgColor?: "error" | "warning" | "primary" | "success";
};

const colorMap = {
  error: "bg-error-soft text-error-text ring-error-soft hover:ring-error",
  warning: "bg-warning-soft text-warning-text ring-warning-soft hover:ring-warning",
  primary: "bg-primary-soft text-primary-text ring-primary-soft hover:ring-primary",
  success: "bg-success-soft text-success-text ring-success-soft hover:ring-success",
} as const;

export function RatingButton({
  label,
  interval,
  shortcut,
  onClick,
  bgColor = "primary",
}: RatingButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-1 flex-col items-center gap-0.5 rounded-md px-1 py-2 ring-1 transition-all duration-200",
        colorMap[bgColor],
      )}
    >
      <span className="text-[10px] font-semibold opacity-50">[ {shortcut} ]</span>
      <span className="text-xs font-medium leading-tight mt-0.5 md:text-sm">{label}</span>
      <span className="text-[10px] font-medium opacity-60">{interval}</span>
    </button>
  );
}
