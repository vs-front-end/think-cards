import { memo, useEffect } from "react";
import { Text } from "@stellar-ui-kit/web";
import { cn } from "@stellar-ui-kit/shared";
import { Volume2 } from "lucide-react";
import { useSpeech } from "@/hooks";

type CardFaceProps = {
  label: string;
  progress: string;
  html: string;
  lang?: string | null;
  canSpeak?: boolean;
};

export const CardFace = memo(
  ({ label, progress, html, lang, canSpeak }: CardFaceProps) => {
    const { toggle, stop, isSpeaking, isSupported } = useSpeech();

    useEffect(() => stop, [html, stop]);

    const showSpeak = canSpeak && isSupported && !!lang;

    return (
      <>
        <div className="relative flex shrink-0 items-center justify-between px-5 py-3">
          <Text
            as="span"
            className="text-[11px] font-semibold uppercase tracking-widest text-muted"
          >
            {label}
          </Text>

          <div className="flex items-center gap-2">
            {showSpeak && (
              <button
                type="button"
                onClick={() => toggle(html, lang ?? undefined)}
                aria-label={isSpeaking ? "Stop" : "Speak"}
                className={cn(
                  "flex shrink-0 items-center justify-center transition-colors pb-0.5",
                  isSpeaking
                    ? "text-primary"
                    : "text-muted hover:text-foreground",
                )}
              >
                <Volume2 className="size-3.5" />
              </button>
            )}

            <Text
              as="span"
              className="text-[11px] font-medium tabular-nums text-muted"
            >
              {progress}
            </Text>
          </div>
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
