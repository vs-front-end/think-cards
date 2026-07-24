import { memo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Text } from "@stellar-ui-kit/web";
import { cn } from "@stellar-ui-kit/shared";
import { Volume2 } from "lucide-react";
import { useSpeech } from "@/hooks";

type CardFaceProps = {
  label: string;
  progress: string;
  html: string;
  lang?: string | null;
  active?: boolean;
};

export const CardFace = memo(
  ({ label, progress, html, lang, active }: CardFaceProps) => {
    const { t } = useTranslation();
    const { toggle, stop, isSpeaking, isSupported } = useSpeech();

    useEffect(() => stop, [html, stop]);

    const showSpeak = isSupported && !!lang;

    useEffect(() => {
      if (!active || !showSpeak) return;

      const handler = (e: KeyboardEvent) => {
        const el = document.activeElement;
        const isInputFocused =
          e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement ||
          el instanceof HTMLInputElement ||
          el instanceof HTMLTextAreaElement;

        if (isInputFocused || e.code !== "KeyR") return;

        e.preventDefault();
        toggle(html, lang ?? undefined);
      };

      window.addEventListener("keydown", handler);
      return () => window.removeEventListener("keydown", handler);
    }, [active, showSpeak, html, lang, toggle]);

    return (
      <>
        <div className="relative flex shrink-0 items-center justify-between px-5 py-3">
          <Text
            as="span"
            className="text-[11px] font-semibold uppercase tracking-widest text-muted"
          >
            {label}
          </Text>
          <Text
            as="span"
            className="text-[11px] font-medium tabular-nums text-muted"
          >
            {progress}
          </Text>

          {showSpeak && (
            <button
              type="button"
              onClick={() => toggle(html, lang ?? undefined)}
              aria-label={isSpeaking ? t("studyStop") : t("studySpeak")}
              className={cn(
                "flex shrink-0 items-center justify-center gap-1 transition-colors pb-0.5",
                isSpeaking
                  ? "text-primary"
                  : "text-muted hover:text-foreground",
              )}
            >
              <Volume2 className="size-3.5" />
              <span className="hidden pt-0.5 text-[10px] font-semibold opacity-50 md:inline">
                [ R ]
              </span>
            </button>
          )}
        </div>

        <div className="mx-4 h-px bg-border" />

        <div className="themed-scroll flex flex-1 overflow-auto">
          <div
            className="prose prose-lg m-auto max-w-none px-8 py-8 text-center text-foreground [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </>
    );
  },
);

CardFace.displayName = "CardFace";
