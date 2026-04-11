import { cn } from "@stellar-ui-kit/shared";
import { Pause, Play } from "lucide-react";
import { formatTime } from "@/utils/format";

type SessionBarProps = {
  elapsedMs: number;
  paused: boolean;
  onTogglePause: () => void;
};

export function SessionBar({
  elapsedMs,
  paused,
  onTogglePause,
}: SessionBarProps) {
  return (
    <div className="flex items-center bg-surface px-5 py-2.5">
      <button
        type="button"
        onClick={onTogglePause}
        className={cn(
          "flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors",
          paused
            ? "bg-warning-soft text-warning-text"
            : "bg-background text-foreground",
        )}
      >
        {paused ? (
          <Play className="size-3.5" />
        ) : (
          <Pause className="size-3.5" />
        )}

        <span className="font-mono text-xs font-medium tabular-nums">
          {formatTime(elapsedMs)}
        </span>
      </button>
    </div>
  );
}
