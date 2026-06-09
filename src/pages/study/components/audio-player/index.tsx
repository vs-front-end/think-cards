import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { formatTime } from "@/utils";

type AudioPlayerProps = {
  src: string;
};

export const AudioPlayer = ({ src }: AudioPlayerProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentMs, setCurrentMs] = useState(0);
  const [durationMs, setDurationMs] = useState(0);

  useEffect(() => {
    setIsPlaying(false);
    setProgress(0);
    setCurrentMs(0);
  }, [src]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      audio.play().catch(() => setIsPlaying(false));
    } else {
      audio.pause();
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    audio.currentTime = ratio * audio.duration;
  };

  return (
    <div className="flex w-full max-w-md items-center gap-3 rounded-md bg-surface px-3 py-2 ring-1 ring-border">
      <button
        type="button"
        onClick={togglePlay}
        aria-label={isPlaying ? "Pause" : "Play"}
        className="flex shrink-0 items-center justify-center text-muted transition-colors hover:text-foreground"
      >
        {isPlaying ? (
          <Pause className="size-4" />
        ) : (
          <Play className="size-4" />
        )}
      </button>

      <div
        onClick={handleSeek}
        className="relative h-1 flex-1 cursor-pointer rounded-full bg-border"
      >
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-muted"
          style={{ width: `${progress}%` }}
        />
      </div>

      <span className="shrink-0 font-mono text-[11px] tabular-nums text-muted">
        {formatTime(currentMs)} / {formatTime(durationMs)}
      </span>

      <audio
        ref={audioRef}
        src={src}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => {
          setIsPlaying(false);
          setProgress(0);
          setCurrentMs(0);
        }}
        onLoadedMetadata={(e) =>
          setDurationMs(e.currentTarget.duration * 1000)
        }
        onTimeUpdate={(e) => {
          const audio = e.currentTarget;
          setCurrentMs(audio.currentTime * 1000);
          setProgress(
            audio.duration ? (audio.currentTime / audio.duration) * 100 : 0,
          );
        }}
      />
    </div>
  );
};
