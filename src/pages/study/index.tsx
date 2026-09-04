import DOMPurify from "dompurify";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "@tanstack/react-router";
import { Button, InputText, Text } from "@stellar-ui-kit/web";
import { cn } from "@stellar-ui-kit/shared";
import { Pause, Play } from "lucide-react";
import { toast } from "sonner";
import { useLiveQuery } from "dexie-react-hooks";
import { Loader } from "@/components";
import { db } from "@/lib/db";
import { useStudySession } from "@/hooks";
import type { StudyMode } from "@/hooks/useStudySession";
import { requestOnboardingSurvey } from "@/pages/dashboard/components";

import {
  formatTime,
  parseClozePreview,
  parseClozeRevealed,
  stopSpeech,
  stripAudio,
  extractAudioSrc,
} from "@/utils";

import {
  AudioPlayer,
  CardFace,
  CompletionScreen,
  EmptyDeck,
  RatingButtons,
} from "./components";

type StudyPageProps = {
  deckId: string | undefined;
  mode?: StudyMode;
};

type StudySessionProps = {
  deckId: string;
  mode: StudyMode;
};

const StudySession = ({ deckId, mode }: StudySessionProps) => {
  const pausedTotal = useRef(0);
  const pausedAt = useRef<number | null>(null);

  const { t } = useTranslation();
  const navigate = useNavigate();

  const {
    currentCard,
    remainingCount,
    answeredCount,
    isDone,
    emptyReason,
    isLoaded,
    previewIntervals,
    dailyGoal,
    startedAt,
    answerCard,
    saveSession,
  } = useStudySession(deckId, mode);

  const deckLanguage = useLiveQuery(
    () => db.decks.get(deckId).then((d) => d?.language ?? null),
    [deckId],
  );

  const [revealed, setRevealed] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const [noAnim, setNoAnim] = useState(false);
  const [paused, setPaused] = useState(false);
  const [typingInput, setTypingInput] = useState("");
  const [typingChecked, setTypingChecked] = useState(false);
  const [typingCorrect, setTypingCorrect] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);

  const handleReveal = useCallback(() => {
    setRevealed(true);
    setFlipped(true);
  }, []);

  const handleCheckTyping = useCallback(() => {
    if (!currentCard) return;

    const expected = DOMPurify.sanitize(currentCard.back, { ALLOWED_TAGS: [] })
      .trim()
      .toLowerCase();

    const correct = typingInput.trim().toLowerCase() === expected;

    setTypingCorrect(correct);
    setTypingChecked(true);
    setRevealed(true);
  }, [typingInput, currentCard]);

  const handleAnswer = useCallback(
    async (rating: 1 | 2 | 3 | 4) => {
      await answerCard(rating);
    },
    [answerCard],
  );

  const handleFinish = useCallback(() => {
    saveSession().catch(console.error);
    if (mode === "scheduled" && answeredCount > 0) requestOnboardingSurvey();
    navigate({ to: "/dashboard" });
  }, [saveSession, answeredCount, mode, navigate]);

  useEffect(() => {
    if (isDone) return;

    if (paused) {
      pausedAt.current = Date.now();
      return;
    }

    if (pausedAt.current !== null) {
      pausedTotal.current += Date.now() - pausedAt.current;
      pausedAt.current = null;
    }

    const interval = setInterval(() => {
      setElapsedMs(Date.now() - startedAt.getTime() - pausedTotal.current);
    }, 1000);

    return () => clearInterval(interval);
  }, [isDone, paused, startedAt]);

  useEffect(() => {
    stopSpeech();
    setNoAnim(true);
    setRevealed(false);
    setFlipped(false);
    setTypingInput("");
    setTypingChecked(false);
    setTypingCorrect(false);

    const id = requestAnimationFrame(() => setNoAnim(false));
    return () => cancelAnimationFrame(id);
  }, [currentCard?.id]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const active = document.activeElement;

      const isInputFocused =
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        active instanceof HTMLInputElement ||
        active instanceof HTMLTextAreaElement;

      if (isInputFocused) return;

      if (
        currentCard?.type === "typing" &&
        e.code === "Enter" &&
        !typingChecked
      ) {
        e.preventDefault();
        handleCheckTyping();
        return;
      }

      if (e.code === "Space" && !revealed && currentCard?.type !== "typing") {
        e.preventDefault();
        handleReveal();
        return;
      }

      if (revealed && ["1", "2", "3", "4"].includes(e.key)) {
        handleAnswer(parseInt(e.key, 10) as 1 | 2 | 3 | 4).catch(console.error);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [revealed, typingChecked, currentCard?.type]);

  useEffect(() => {
    if (!isLoaded || !emptyReason) return;

    const message =
      emptyReason === "no_cards" ? t("deckNoCards") : t("deckNoCardsDue");

    toast.info(message);
    navigate({ to: "/decks" });
  }, [isLoaded, emptyReason]);

  const { sanitizedFront, sanitizedBack, frontAudio, backAudio } =
    useMemo(() => {
      if (!currentCard) {
        return {
          sanitizedFront: "",
          sanitizedBack: "",
          frontAudio: null,
          backAudio: null,
        };
      }

      const isClozeCard = currentCard.type === "cloze";

      const rawFront = isClozeCard
        ? parseClozePreview(currentCard.front)
        : currentCard.front;

      const rawBack = isClozeCard
        ? parseClozeRevealed(currentCard.front)
        : currentCard.back;

      const addLinkTargets = (html: string) =>
        html.replace(/<a /g, '<a target="_blank" rel="noopener noreferrer" ');

      return {
        sanitizedFront: addLinkTargets(
          DOMPurify.sanitize(stripAudio(rawFront)),
        ),
        sanitizedBack: addLinkTargets(DOMPurify.sanitize(stripAudio(rawBack))),
        frontAudio: extractAudioSrc(rawFront),
        backAudio: extractAudioSrc(rawBack),
      };
    }, [currentCard]);

  if (!isLoaded || emptyReason) {
    return <Loader />;
  }

  if (isDone) {
    return (
      <CompletionScreen
        answeredCount={answeredCount}
        elapsedMs={elapsedMs}
        dailyGoal={dailyGoal}
        mode={mode}
        onBack={handleFinish}
      />
    );
  }

  if (!currentCard) {
    if (!isLoaded) return null;
    return <EmptyDeck />;
  }

  const isCloze = currentCard.type === "cloze";
  const isTyping = currentCard.type === "typing";

  const sanitizedCorrectAnswer = DOMPurify.sanitize(currentCard.back, {
    ALLOWED_TAGS: [],
  });

  const totalCards = answeredCount + remainingCount;
  const progress = `${answeredCount + 1}/${totalCards}`;

  const cardTypeLabel = isCloze
    ? t("studyClozeLabel")
    : isTyping
      ? t("studyTypingLabel")
      : undefined;

  const frontLabel = cardTypeLabel ?? t("studyFrontLabel");
  const backLabel = cardTypeLabel ?? t("studyBackLabel");

  return (
    <div className="relative flex flex-1 flex-col items-center justify-center gap-2.5 px-4 py-6">
      {mode === "practice" && (
        <Text
          as="span"
          className="absolute left-4 top-4 rounded-full bg-primary-soft px-3 py-1.5 text-xs font-medium text-primary-text"
        >
          {t("studyPracticeMode")}
        </Text>
      )}

      <button
        type="button"
        onClick={() => setPaused((p) => !p)}
        className={cn(
          "absolute right-4 top-4 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs transition-colors",
          paused
            ? "bg-warning-soft text-warning-text"
            : "bg-surface text-muted ring-1 ring-border hover:text-foreground",
        )}
      >
        {paused ? <Play className="size-3" /> : <Pause className="size-3" />}

        <span className="font-mono font-medium tabular-nums">
          {formatTime(elapsedMs)}
        </span>
      </button>

      <div className="w-full max-w-md" style={{ perspective: "1200px" }}>
        <div
          className={cn(
            "grid [transform-style:preserve-3d]",
            noAnim
              ? "transition-none"
              : "transition-transform duration-600 [transition-timing-function:cubic-bezier(0.4,0,0.2,1)]",
            !isTyping && flipped && "[transform:rotateY(180deg)]",
          )}
        >
          <div
            className={cn(
              "relative flex h-[44svh] flex-col overflow-hidden rounded-md bg-surface ring-1 [backface-visibility:hidden] [grid-area:1/1]",
              isTyping && typingChecked && typingCorrect && "ring-success",
              isTyping && typingChecked && !typingCorrect && "ring-error",
              !(isTyping && typingChecked) && "ring-border",
            )}
          >
            <CardFace
              label={frontLabel}
              progress={progress}
              html={sanitizedFront}
              lang={deckLanguage}
              active={isTyping || !revealed}
            />

            {isTyping && typingChecked && (
              <>
                <div className="mx-4 h-px bg-border" />
                <div className="flex shrink-0 items-center justify-between px-5 py-2.5">
                  <Text
                    as="span"
                    className="text-[10px] font-semibold uppercase tracking-widest text-muted"
                  >
                    {t("studyAnswerLabel")}:
                  </Text>

                  <Text
                    as="span"
                    className={cn(
                      "text-xs font-medium",
                      typingCorrect ? "text-success" : "text-error",
                    )}
                  >
                    {typingCorrect ? t("studyCorrect") : t("studyIncorrect")}!
                  </Text>
                </div>
              </>
            )}
          </div>

          {!isTyping && (
            <div className="relative flex h-[44svh] flex-col overflow-hidden rounded-md bg-surface ring-1 ring-border [backface-visibility:hidden] [grid-area:1/1] [transform:rotateY(180deg)]">
              <CardFace
                label={backLabel}
                progress={progress}
                html={sanitizedBack}
                lang={deckLanguage}
                active={revealed}
              />
            </div>
          )}
        </div>
      </div>

      {(revealed ? backAudio : frontAudio) && (
        <AudioPlayer src={(revealed ? backAudio : frontAudio) as string} />
      )}

      {isTyping && !typingChecked && (
        <div
          className="flex w-full max-w-md gap-2"
          onKeyDown={(e) => {
            if (e.code === "Enter") {
              e.preventDefault();
              handleCheckTyping();
            }
          }}
        >
          <InputText
            value={typingInput}
            onChange={(value) => setTypingInput(value)}
            placeholder={t("studyTypeAnswer")}
            className="flex-1"
          />

          <Button
            type="button"
            onClick={handleCheckTyping}
            disabled={!typingInput.trim()}
          >
            {t("studyCheck")}
          </Button>
        </div>
      )}

      {isTyping && typingChecked && (
        <div className="flex w-full max-w-md flex-col gap-2.5">
          <div className="flex gap-2.5">
            <div
              className={cn(
                "flex-1 rounded-md bg-surface px-3 py-2 ring-1",
                typingCorrect ? "ring-success" : "ring-error",
              )}
            >
              <Text
                as="p"
                className="text-[10px] font-medium uppercase tracking-wider text-muted"
              >
                {t("studyCorrectAnswer")}
              </Text>

              <Text
                as="p"
                className="mt-0.5 text-xs font-normal text-foreground"
              >
                {sanitizedCorrectAnswer}
              </Text>
            </div>

            <div
              className={cn(
                "flex-1 rounded-md bg-surface px-3 py-2 ring-1",
                typingCorrect ? "ring-success" : "ring-error",
              )}
            >
              <Text
                as="p"
                className="text-[10px] font-medium uppercase tracking-wider text-muted"
              >
                {t("studyYourAnswer")}
              </Text>

              <Text
                as="p"
                className="mt-0.5 text-xs font-normal text-foreground"
              >
                {typingInput.trim()}
              </Text>
            </div>
          </div>

          <RatingButtons
            previewIntervals={previewIntervals}
            onAnswer={handleAnswer}
          />
        </div>
      )}

      {!isTyping && !revealed && (
        <div className="flex w-full max-w-md flex-col items-center gap-2">
          <Button
            type="button"
            onClick={handleReveal}
            className="flex h-10 w-full max-w-md rounded-md font-normal"
          >
            {t("studyRevealAnswer")}
          </Button>

          <span className="mt-1 hidden text-[10px] font-medium text-muted md:block">
            {t("studyRevealHint", { key: t("studyRevealSpace") })}
          </span>
        </div>
      )}

      {!isTyping && revealed && (
        <RatingButtons
          previewIntervals={previewIntervals}
          onAnswer={handleAnswer}
        />
      )}
    </div>
  );
};

export const StudyPage = ({ deckId, mode = "scheduled" }: StudyPageProps) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!deckId) navigate({ to: "/decks" });
  }, [deckId, navigate]);

  if (!deckId) return null;

  return <StudySession key={`${deckId}:${mode}`} deckId={deckId} mode={mode} />;
};
