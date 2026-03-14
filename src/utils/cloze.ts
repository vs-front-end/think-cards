export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function parseClozePreview(text: string): string {
  return text.replace(/\{\{c\d+::([^}]+)\}\}/g, "[…]");
}

export function parseClozeRevealed(text: string): string {
  return text.replace(
    /\{\{c\d+::([^}]+)\}\}/g,
    (_, content) =>
      `<span class="rounded bg-primary-soft px-1 font-medium text-primary">${escapeHtml(content)}</span>`,
  );
}

export function nextClozeIndex(text: string): number {
  const matches = [...text.matchAll(/\{\{c(\d+)::/g)];
  if (!matches.length) return 1;
  return Math.max(...matches.map((m) => parseInt(m[1], 10))) + 1;
}
