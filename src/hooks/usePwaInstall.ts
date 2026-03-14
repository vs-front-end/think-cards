import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const SNOOZED_UNTIL_KEY = "pwa_install_snoozed_until";
const SNOOZE_MS = 7 * 24 * 60 * 60 * 1000;

const isSnoozed = () => {
  try {
    const until = localStorage.getItem(SNOOZED_UNTIL_KEY);
    return until !== null && Date.now() < Number(until);
  } catch {
    return false;
  }
};

export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  const [dismissed, setDismissed] = useState(() => isSnoozed());

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const install = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();

    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setDeferredPrompt(null);
  };

  const dismiss = () => {
    try {
      localStorage.setItem(SNOOZED_UNTIL_KEY, String(Date.now() + SNOOZE_MS));
    } catch {
      console.error("Failed to snooze PWA install prompt");
    }

    setDismissed(true);
  };

  return {
    canInstall: !!deferredPrompt && !dismissed,
    install,
    dismiss,
  };
}
