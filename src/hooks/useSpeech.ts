import { useCallback, useEffect, useState } from "react";

import {
  htmlToSpeechText,
  isSpeechSupported,
  speakText,
  stopSpeech,
} from "@/utils/speech";

export function useSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => () => stopSpeech(), []);

  const speak = useCallback((html: string, lang?: string) => {
    const text = htmlToSpeechText(html);
    if (!text) return;

    speakText(
      text,
      {
        onStart: () => setIsSpeaking(true),
        onEnd: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      },
      lang,
    );
  }, []);

  const stop = useCallback(() => {
    stopSpeech();
    setIsSpeaking(false);
  }, []);

  const toggle = useCallback(
    (html: string, lang?: string) => {
      if (isSpeaking) {
        stop();
        return;
      }
      speak(html, lang);
    },
    [isSpeaking, speak, stop],
  );

  return {
    speak,
    stop,
    toggle,
    isSpeaking,
    isSupported: isSpeechSupported(),
  };
}
