import DOMPurify from "dompurify";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "@tanstack/react-router";
import { Button, Card, InputText, Text } from "@stellar-ui-kit/web";
import { cn } from "@stellar-ui-kit/shared";
import { BookOpen, CheckCircle, PartyPopper, XCircle } from "lucide-react";
import { CompletionScreen, RatingButton, SessionBar } from "@/components";
import { useStudySession } from "@/hooks";
import { parseClozePreview, parseClozeRevealed } from "@/utils";

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

  const ratingButtons = (
    <div className="flex w-full max-w-xl flex-wrap justify-center gap-2">
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
  );

  return (
    <div className="flex flex-1 flex-col">
      <SessionBar
        answeredCount={answeredCount}
        remainingCount={remainingCount}
        dailyGoal={sessionStats.dailyGoal}
        studiedToday={sessionStats.studiedToday}
        elapsedMs={elapsedMs}
        paused={paused}
        onTogglePause={() => setPaused((p) => !p)}
      />

      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-8">
        <div
          className="w-full max-w-xl"
          style={{ perspective: "1200px" }}
        >
          <div
            className={cn(
              "grid transition-transform duration-500 [transform-style:preserve-3d]",
              !isTyping && flipped && "[transform:rotateY(180deg)]",
            )}
          >
            <Card
              className="themed-scroll flex flex-col overflow-y-auto rounded-lg [backface-visibility:hidden] [grid-area:1/1]"
              style={{ maxHeight: "42svh", minHeight: "14rem" }}
            >
              <div
                className="prose prose-sm my-auto max-w-none w-full px-6 py-6 text-center text-foreground"
                dangerouslySetInnerHTML={{
                  __html: addLinkTargets(sanitizedFront),
                }}
              />
            </Card>

            {!isTyping && (
              <Card
                className="themed-scroll flex flex-col overflow-y-auto rounded-lg [backface-visibility:hidden] [grid-area:1/1] [transform:rotateY(180deg)]"
                style={{ maxHeight: "42svh", minHeight: "14rem" }}
              >
                <div
                  className="prose prose-sm my-auto max-w-none w-full px-6 py-6 text-center text-foreground"
                  dangerouslySetInnerHTML={{
                    __html: addLinkTargets(sanitizedBack),
                  }}
                />
              </Card>
            )}
          </div>
        </div>

        {isTyping ? (
          <>
            {!typingChecked && (
              <div
                className="flex w-full max-w-xl gap-2"
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

            {typingChecked && (
              <div className="flex w-full max-w-xl flex-col gap-4">
                <div
                  className={cn(
                    "flex items-start gap-2 p-4 text-white",
                    typingCorrect ? "bg-success" : "bg-error",
                  )}
                >
                  {typingCorrect ? (
                    <CheckCircle className="size-4 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="size-4 shrink-0 mt-0.5" />
                  )}

                  <div className="flex flex-1 flex-col gap-0.5">
                    <Text as="p" className="text-sm font-semibold text-white">
                      {typingCorrect ? t("studyCorrect") : t("studyIncorrect")}
                    </Text>

                    {!typingCorrect && (
                      <Text as="p" className="text-xs text-white">
                        {t("studyCorrectAnswer")}{" "}
                        <span className="font-semibold">
                          {sanitizedCorrectAnswer}
                        </span>
                      </Text>
                    )}

                    <Text as="p" className="text-xs text-white">
                      {t("studyYourAnswer")} {typingInput.trim()}
                    </Text>
                  </div>
                </div>
                {ratingButtons}
              </div>
            )}
          </>
        ) : !revealed ? (
          <Button
            type="button"
            onClick={handleReveal}
            className="w-full max-w-xl"
          >
            <BookOpen className="size-4" />
            {t("studyRevealAnswer")}
            <span className="ml-1 text-xs opacity-50">
              {t("studyRevealSpace")}
            </span>
          </Button>
        ) : (
          ratingButtons
        )}
      </div>
    </div>
  );
}
