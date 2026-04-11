export const computeStreaks = (
  reviewedDates: string[],
): { streak: number; maxStreak: number } => {
  if (!reviewedDates.length) return { streak: 0, maxStreak: 0 };

  const days = [...new Set(reviewedDates.map((d) => d.slice(0, 10)))].sort(
    (a, b) => b.localeCompare(a),
  );

  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  let streak = 0;

  if (days[0] === today || days[0] === yesterday) {
    streak = 1;

    for (let i = 1; i < days.length; i++) {
      const prev = new Date(days[i - 1]);
      const curr = new Date(days[i]);
      const diff = Math.round((prev.getTime() - curr.getTime()) / 86400000);

      if (diff === 1) streak++;
      else break;
    }
  }

  let maxStreak = 1;
  let current = 1;

  for (let i = 1; i < days.length; i++) {
    const prev = new Date(days[i - 1]);
    const curr = new Date(days[i]);
    const diff = Math.round((prev.getTime() - curr.getTime()) / 86400000);

    if (diff === 1) {
      current++;
      if (current > maxStreak) maxStreak = current;
    } else {
      current = 1;
    }
  }

  return { streak, maxStreak: Math.max(streak, maxStreak) };
};

export const computeStreak = (reviewedDates: string[]): number =>
  computeStreaks(reviewedDates).streak;
