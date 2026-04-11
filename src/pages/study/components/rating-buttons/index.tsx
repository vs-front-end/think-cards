import { useTranslation } from "react-i18next";
import { cn } from "@stellar-ui-kit/shared";

type RatingButtonsProps = {
  previewIntervals: Record<number, string> | null | undefined;
  onAnswer: (rating: 1 | 2 | 3 | 4) => void;
};

const COLOR_MAP = {
  error: "bg-error-soft text-error-text ring-error-soft hover:ring-error",
  warning:
    "bg-warning-soft text-warning-text ring-warning-soft hover:ring-warning",
  primary:
    "bg-primary-soft text-primary-text ring-primary-soft hover:ring-primary",
  success:
    "bg-success-soft text-success-text ring-success-soft hover:ring-success",
};

const RATINGS = [
  { rating: 1, labelKey: "studyRatingAgain", bgColor: "error" },
  { rating: 2, labelKey: "studyRatingHard", bgColor: "warning" },
  { rating: 3, labelKey: "studyRatingGood", bgColor: "primary" },
  { rating: 4, labelKey: "studyRatingEasy", bgColor: "success" },
] as const;

export const RatingButtons = ({
  previewIntervals,
  onAnswer,
}: RatingButtonsProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-2">
      <div className="flex w-full justify-center gap-2.5">
        {RATINGS.map(({ rating, labelKey, bgColor }) => (
          <button
            key={rating}
            type="button"
            onClick={() => onAnswer(rating)}
            className={cn(
              "flex flex-1 flex-col items-center gap-0.5 rounded-md px-1 py-2 ring-1 transition-all duration-200",
              COLOR_MAP[bgColor],
            )}
          >
            <span className="text-[10px] font-semibold opacity-50">
              [ {rating} ]
            </span>
            <span className="mt-0.5 text-xs font-medium leading-tight md:text-sm">
              {t(labelKey)}
            </span>
            <span className="text-[10px] font-medium opacity-60">
              {previewIntervals?.[rating] ?? ""}
            </span>
          </button>
        ))}
      </div>

      <span className="mt-1 hidden text-[10px] font-medium text-muted md:block">
        {t("studyRatingHint")}
      </span>
    </div>
  );
};
