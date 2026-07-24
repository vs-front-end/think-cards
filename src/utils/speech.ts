import DOMPurify from "dompurify";

type SpeakCallbacks = {
  onStart?: () => void;
  onEnd?: () => void;
  onError?: () => void;
};

let activeCallbacks: SpeakCallbacks | null = null;
let pendingSpeak: ReturnType<typeof setTimeout> | null = null;

function langBase(lang: string): string {
  return lang.toLowerCase().split("-")[0];
}

function voiceBaseName(name: string): string {
  return name.split("(")[0].trim();
}

function pickVoice(lang: string | undefined): SpeechSynthesisVoice | undefined {
  if (!lang) return undefined;

  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return undefined;

  const base = langBase(lang);

  const matches = voices.filter(
    (v) => v.localService && langBase(v.lang) === base,
  );

  if (!matches.length) return undefined;

  const langsByName = new Map<string, Set<string>>();

  for (const v of voices) {
    const name = voiceBaseName(v.name);
    const set = langsByName.get(name) ?? new Set<string>();

    set.add(langBase(v.lang));
    langsByName.set(name, set);
  }

  const isCharacterVoice = (v: SpeechSynthesisVoice) =>
    (langsByName.get(voiceBaseName(v.name))?.size ?? 0) >= 3;

  const isPremium = (v: SpeechSynthesisVoice) =>
    /premium|enhanced/i.test(v.name);

  const score = (v: SpeechSynthesisVoice) =>
    (isPremium(v) ? 4 : 0) +
    (isCharacterVoice(v) ? 0 : 2) +
    (v.default ? 1 : 0);

  return [...matches].sort((a, b) => score(b) - score(a))[0];
}

export function htmlToSpeechText(html: string): string {
  return DOMPurify.sanitize(html, { ALLOWED_TAGS: [] }).trim();
}

export function isSpeechSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function speakText(
  text: string,
  callbacks?: SpeakCallbacks,
  lang?: string,
): boolean {
  if (!isSpeechSupported()) return false;

  const trimmed = text.trim();
  if (!trimmed) return false;

  stopSpeech();

  const utterance = new SpeechSynthesisUtterance(trimmed);
  if (lang) utterance.lang = lang;

  const voice = pickVoice(lang);

  if (voice) {
    utterance.voice = voice;
    utterance.lang = voice.lang;
  }

  const callbacksRef = callbacks ?? null;
  activeCallbacks = callbacksRef;

  utterance.onstart = () => {
    if (activeCallbacks === callbacksRef) callbacksRef?.onStart?.();
  };

  utterance.onend = () => {
    if (activeCallbacks !== callbacksRef) return;
    activeCallbacks = null;
    callbacksRef?.onEnd?.();
  };

  utterance.onerror = () => {
    if (activeCallbacks !== callbacksRef) return;
    activeCallbacks = null;
    callbacksRef?.onError?.();
  };

  pendingSpeak = setTimeout(() => {
    pendingSpeak = null;
    if (activeCallbacks !== callbacksRef) return;
    window.speechSynthesis.speak(utterance);
    window.speechSynthesis.resume();
  }, 120);

  return true;
}

export function stopSpeech(): void {
  if (!isSpeechSupported()) return;

  if (pendingSpeak) {
    clearTimeout(pendingSpeak);
    pendingSpeak = null;
  }

  const callbacks = activeCallbacks;
  activeCallbacks = null;

  window.speechSynthesis.cancel();
  callbacks?.onEnd?.();
}
