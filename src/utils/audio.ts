const MAX_SIZE_BYTES = 1024 * 1024;
const ALLOWED_TYPE = "audio/mpeg";

const AUDIO_BLOCK = /<p>\s*<audio[^>]*><\/audio>\s*<\/p>|<audio[^>]*><\/audio>/gi;

export const isValidAudio = (file: File): boolean =>
  file.type === ALLOWED_TYPE && file.size <= MAX_SIZE_BYTES;

export const extractAudioSrc = (html: string): string | null => {
  const match = html.match(/<audio[^>]*\ssrc="([^"]+)"/i);
  return match?.[1] ?? null;
};

export const stripAudio = (html: string): string =>
  html.replace(AUDIO_BLOCK, "").trim();

export const appendAudio = (html: string, src: string): string =>
  `${stripAudio(html)}<p><audio controls src="${src}"></audio></p>`;
