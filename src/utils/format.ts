export const formatTimePerCard = (seconds: number): {
  value: number;
  unit: "s" | "m" | "h";
} => {
  if (seconds >= 3600) {
    return { value: Math.round(seconds / 3600), unit: "h" };
  }

  if (seconds >= 60) {
    return { value: Math.round(seconds / 60), unit: "m" };
  }

  return { value: seconds, unit: "s" };
};

export const formatTime = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;

  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

export const truncate = (str: string, max: number): string => {
  const t = str.trim();
  if (t.length <= max) return t;

  return t.slice(0, max) + "…";
};

export const formatStudyTime = (ms: number): string => {
  const totalMinutes = Math.floor(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;

  return `${hours}h ${minutes}m`;
};
