import { Text } from "@stellar-ui-kit/web";
import { CheckCircle2, Library, Pause, Play, Target } from "lucide-react";
import { formatTime } from "@/utils/format";

type SessionBarProps = {
  answeredCount: number;
  remainingCount: number;
  dailyGoal: number;
  studiedToday: number;
  elapsedMs: number;
  paused: boolean;
  onTogglePause: () => void;
};

export function SessionBar({
  answeredCount,
  remainingCount,
  dailyGoal,
  studiedToday,
  elapsedMs,
  paused,
  onTogglePause,
}: SessionBarProps) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border bg-surface px-4 py-2">
      <div className="flex items-center gap-4 text-sm">
        <button
          type="button"
          onClick={onTogglePause}
          className="flex items-center gap-1.5 rounded-md px-2 py-1 text-muted transition-colors hover:bg-muted/20 hover:text-foreground"
        >
          {paused ? (
            <Play className="size-3.5" />
          ) : (
            <Pause className="size-3.5" />
          )}
          
          <span className="font-mono tabular-nums">
            {formatTime(elapsedMs)}
          </span>
        </button>

        <span className="hidden h-4 w-px bg-border sm:block" />

        <span className="hidden items-center gap-1.5 sm:flex">
          <CheckCircle2 className="size-3.5 text-success" />
          <Text as="span" className="tabular-nums">
            {answeredCount}
          </Text>
        </span>

        <span className="flex items-center gap-1.5">
          <Target className="size-3.5 text-primary" />
          <Text as="span" className="tabular-nums">
            {studiedToday}/{dailyGoal}
          </Text>
        </span>

        <span className="flex items-center gap-1.5">
          <Library className="size-3.5 text-muted" />
          <Text as="span" className="tabular-nums text-muted">
            {remainingCount}
          </Text>
        </span>
      </div>
    </div>
  );
}
