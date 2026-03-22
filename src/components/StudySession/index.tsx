import DOMPurify from "dompurify";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "@tanstack/react-router";
import { Button, InputText, Text } from "@stellar-ui-kit/web";
import { cn } from "@stellar-ui-kit/shared";
import { Pause, PartyPopper, Play } from "lucide-react";
import { CompletionScreen, RatingButton } from "@/components";
import { useStudySession } from "@/hooks";
import { parseClozePreview, parseClozeRevealed } from "@/utils";
import { formatTime } from "@/utils/format";

type StudySessionProps = {
  deckId: string;
};

export function StudySession({ deckId }: StudySessionProps) {
  const pausedTotal = useRef(0);
  const pausedAt = useRef<number | null>(null);

  const { t } = useTranslation();
  const navigate = useNavigate();

  const {
    currentCard,
    remainingCount,
    answeredCount,
    isDone,
    isLoaded,
    previewIntervals,
    sessionStats,
    startedAt,
    answerCard,
    saveSession,
  } = useStudySession(deckId);

  const [revealed, setRevealed] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const [paused, setPaused] = useState(false);
  const [typingInput, setTypingInput] = useState("");
  const [typingChecked, setTypingChecked] = useState(false);
  const [typingCorrect, setTypingCorrect] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);

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
    setRevealed(false);
    setFlipped(false);
    setTypingInput("");
    setTypingChecked(false);
    setTypingCorrect(false);
  }, [currentCard?.id]);

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
  }, [
    revealed,
    typingChecked,
    currentCard?.type,
    handleReveal,
    handleAnswer,
    handleCheckTyping,
  ]);

  if (isDone) {
    return (
      <CompletionScreen
        answeredCount={answeredCount}
        elapsedMs={elapsedMs}
        dailyGoal={sessionStats.dailyGoal}
        onBack={() => {
          saveSession().catch(console.error);
          navigate({ to: "/dashboard" });
        }}
      />
    );
  }

  if (!currentCard) {
    if (!isLoaded) return null;

    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-12 text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-success-soft text-success">
          <PartyPopper className="size-7" />
        </div>

        <div className="space-y-1">
          <Text as="h2" className="text-xl font-semibold">
            {t("studyNoCardsTitle")}
          </Text>

          <Text as="p" className="text-sm text-muted">
            {t("studyNoCardsDesc")}
          </Text>
        </div>

        <Button type="button" onClick={() => navigate({ to: "/dashboard" })}>
          {t("studyBackToDashboard")}
        </Button>
      </div>
    );
  }

  const isCloze = currentCard.type === "cloze";
  const isTyping = currentCard.type === "typing";

  const frontContent = isCloze
    ? parseClozePreview(currentCard.front)
    : currentCard.front;
  const backContent = isCloze
    ? parseClozeRevealed(currentCard.front)
    : currentCard.back;

  const sanitizedFront = DOMPurify.sanitize(frontContent, {
    ADD_ATTR: ["target"],
  });
  const sanitizedBack = DOMPurify.sanitize(backContent, {
    ADD_ATTR: ["target"],
  });

  const addLinkTargets = (html: string) =>
    html.replace(/<a /g, '<a target="_blank" rel="noopener noreferrer" ');
  const sanitizedCorrectAnswer = DOMPurify.sanitize(currentCard.back, {
    ALLOWED_TAGS: [],
  });

  const totalCards = answeredCount + remainingCount;

  const cardTypeLabel = isCloze
    ? t("studyClozeLabel")
    : isTyping
      ? t("studyTypingLabel")
      : undefined;

  const frontLabel = cardTypeLabel ?? t("studyFrontLabel");
  const backLabel = cardTypeLabel ?? t("studyBackLabel");

  const ratingButtons = (
    <div className="flex w-full max-w-md flex-col items-center gap-2">
      <div className="flex w-full justify-center gap-2.5">
        <RatingButton
          label={t("studyRatingAgain")}
          interval={previewIntervals?.[1] ?? ""}
          shortcut="1"
          bgColor="error"
          onClick={() => handleAnswer(1).catch(console.error)}
        />

        <RatingButton
          label={t("studyRatingHard")}
          interval={previewIntervals?.[2] ?? ""}
          shortcut="2"
          bgColor="warning"
          onClick={() => handleAnswer(2).catch(console.error)}
        />

        <RatingButton
          label={t("studyRatingGood")}
          interval={previewIntervals?.[3] ?? ""}
          shortcut="3"
          bgColor="primary"
          onClick={() => handleAnswer(3).catch(console.error)}
        />

        <RatingButton
          label={t("studyRatingEasy")}
          interval={previewIntervals?.[4] ?? ""}
          shortcut="4"
          bgColor="success"
          onClick={() => handleAnswer(4).catch(console.error)}
        />
      </div>

      <span className="hidden text-[10px] font-medium text-muted mt-1 md:block">
        {t("studyRatingHint")}
      </span>
    </div>
  );

  const cardHeader = (label: string) => (
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
        {answeredCount + 1}/{totalCards}
      </Text>
    </div>
  );

  const cardContent = (html: string) => (
    <>
      <div className="mx-4 h-px bg-border" />

      <div className="themed-scroll flex flex-1 overflow-auto">
        <div
          className="prose prose-lg m-auto max-w-none px-8 py-8 text-center text-foreground [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </>
  );

  return (
    <div className="relative flex flex-1 flex-col items-center justify-center gap-2.5 px-4 py-6">
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
            "grid transition-transform duration-600 [transform-style:preserve-3d]",
            "[transition-timing-function:cubic-bezier(0.4,0,0.2,1)]",
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
            {cardHeader(frontLabel)}
            {cardContent(addLinkTargets(sanitizedFront))}

            {isTyping && typingChecked && (
              <>
                <div className="mx-4 h-px bg-border" />
                <div className="flex shrink-0 items-center justify-between px-5 py-2.5">
                  <Text as="span" className="text-[10px] font-semibold uppercase tracking-widest text-muted">
                    {t("studyAnswerLabel")}:
                  </Text>

                  <Text
                    as="span"
                    className={cn(
                      "text-xs font-medium",
                      typingCorrect ? "text-success" : "text-error",
                    )}
                  >
                    {typingCorrect ? t("studyCorrect")! : t("studyIncorrect")}!
                  </Text>
                </div>
              </>
            )}
          </div>

          {!isTyping && (
            <div className="relative flex h-[44svh] flex-col overflow-hidden rounded-md bg-surface ring-1 ring-border [backface-visibility:hidden] [grid-area:1/1] [transform:rotateY(180deg)]">
              {cardHeader(backLabel)}
              {cardContent(addLinkTargets(sanitizedBack))}
            </div>
          )}
        </div>
      </div>

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
              <Text as="p" className="text-[10px] font-medium uppercase tracking-wider text-muted">
                {t("studyCorrectAnswer")}
              </Text>

              <Text as="p" className="text-xs font-normal text-foreground mt-0.5">
                {sanitizedCorrectAnswer}
              </Text>
            </div>

            <div
              className={cn(
                "flex-1 rounded-md bg-surface px-3 py-2 ring-1",
                typingCorrect ? "ring-success" : "ring-error",
              )}
            >
              <Text as="p" className="text-[10px] font-medium uppercase tracking-wider text-muted">
                {t("studyYourAnswer")}
              </Text>

              <Text as="p" className="text-xs font-normal text-foreground mt-0.5">
                {typingInput.trim()}
              </Text>
            </div>
          </div>

          {ratingButtons}
        </div>
      )}

      {!isTyping && !revealed && (
        <div className="flex w-full max-w-md flex-col items-center gap-2">
          <Button
            type="button"
            onClick={handleReveal}
            className="flex w-full max-w-md rounded-md h-10 font-normal"
          >
            {t("studyRevealAnswer")}
          </Button>

          <span className="hidden text-[10px] font-medium text-muted mt-1 md:block">
            {t("studyRevealHint", { key: t("studyRevealSpace") })}
          </span>
        </div>
      )}

      {!isTyping && revealed && ratingButtons}
    </div>
  );
}
