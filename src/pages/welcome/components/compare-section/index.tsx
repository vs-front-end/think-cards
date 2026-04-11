import { useTranslation } from "react-i18next";
import { cn } from "@stellar-ui-kit/shared";
import { Check, Minus } from "lucide-react";

const COMPARE_COLUMNS = [
  { labelKey: "welcomeCompareFsrs", key: "fsrs" as const, soft: true },
  { labelKey: "welcomeCompareSm2", key: "sm2" as const, soft: false },
  { labelKey: "welcomeCompareLeitner", key: "leitner" as const, soft: false },
];

const COMPARE_ROWS = [
  {
    featureKey: "welcomeCompareFeatureScheduling",
    fsrs: "welcomeCompareAdaptive",
    sm2: "welcomeCompareFixed",
    leitner: "welcomeCompareBoxBased",
  },
  {
    featureKey: "welcomeCompareFeatureAdapts",
    fsrs: "check",
    sm2: "no",
    leitner: "no",
  },
  {
    featureKey: "welcomeCompareFeatureRetention",
    fsrs: "welcomeCompareConfigurable",
    sm2: "welcomeCompareNone",
    leitner: "welcomeCompareNone",
  },
  {
    featureKey: "welcomeCompareFeatureOpenSource",
    fsrs: "check",
    sm2: "partial",
    leitner: "check",
  },
];

const STATIC_VALUES = new Set(["check", "no", "partial"]);

type CompareCellProps = {
  value: string;
  onSoft?: boolean;
};

const CompareCell = ({ value, onSoft = false }: CompareCellProps) => {
  const textColor = onSoft ? "text-primary-text" : "text-foreground";

  if (value === "check") {
    return (
      <span className="inline-flex items-center justify-center">
        <Check
          className={cn(
            "size-4",
            onSoft ? "text-primary-text" : "text-success",
          )}
        />
      </span>
    );
  }

  if (value === "no") {
    return (
      <span className="inline-flex items-center justify-center">
        <Minus className="size-4 text-muted" />
      </span>
    );
  }

  if (value === "partial") {
    return (
      <span className="inline-flex items-center justify-center text-sm text-warning">
        ~
      </span>
    );
  }

  return <span className={cn("text-xs", textColor)}>{value}</span>;
};

export const CompareSection = () => {
  const { t } = useTranslation();

  return (
    <section className="w-full border-b border-border bg-surface">
      <div className="mx-auto max-w-7xl px-6 py-14 md:py-16">
        <h2
          className="text-center text-foreground md:text-left"
          style={{
            fontSize: "clamp(1.5rem, 2.5vw, 2.25rem)",
            fontWeight: 700,
            letterSpacing: "-0.025em",
          }}
        >
          {t("welcomeCompareTitle")}
        </h2>

        <p className="mt-2 mb-10 text-center text-sm text-muted md:text-left">
          {t("welcomeCompareSubtitle")}
        </p>

        <div className="flex flex-col gap-3 md:hidden">
          {COMPARE_ROWS.map((row) => (
            <div
              key={row.featureKey}
              className="overflow-hidden rounded-xl border border-border"
            >
              <div className="border-b border-border px-4 py-3 text-center">
                <span className="text-sm font-semibold text-foreground">
                  {t(row.featureKey)}
                </span>
              </div>

              <div className="grid grid-cols-3 divide-x divide-border">
                {COMPARE_COLUMNS.map((col) => (
                  <div
                    key={col.key}
                    className={cn(
                      "flex flex-col items-center gap-1 px-3 py-3 text-center",
                      col.soft && "bg-primary-soft",
                    )}
                  >
                    <span
                      className={cn(
                        "text-[10px] font-semibold",
                        col.soft ? "text-primary-text" : "text-muted",
                      )}
                    >
                      {t(col.labelKey)}
                    </span>
                    <CompareCell
                      value={
                        STATIC_VALUES.has(row[col.key])
                          ? row[col.key]
                          : t(row[col.key])
                      }
                      onSoft={col.soft}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="hidden overflow-hidden rounded-xl border border-border md:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-5 py-3.5 text-left">
                  <span className="text-xs font-medium text-muted">
                    {t("welcomeFeatureFsrsLabel")}
                  </span>
                </th>

                <th className="bg-primary-soft px-5 py-3.5 text-center">
                  <span className="text-xs font-bold text-primary-text">
                    {t("welcomeCompareFsrs")}
                  </span>
                </th>

                <th className="px-5 py-3.5 text-center">
                  <span className="text-xs font-medium text-muted">
                    {t("welcomeCompareSm2")}
                  </span>
                </th>

                <th className="px-5 py-3.5 text-center">
                  <span className="text-xs font-medium text-muted">
                    {t("welcomeCompareLeitner")}
                  </span>
                </th>
              </tr>
            </thead>

            <tbody>
              {COMPARE_ROWS.map((row, i) => (
                <tr
                  key={row.featureKey}
                  className={cn(
                    "border-b border-border last:border-none",
                    i % 2 === 1 && "bg-background",
                  )}
                >
                  <td className="px-5 py-4 font-medium text-foreground">
                    {t(row.featureKey)}
                  </td>

                  <td className="bg-primary-soft px-5 py-4 text-center">
                    <CompareCell
                      value={
                        STATIC_VALUES.has(row.fsrs) ? row.fsrs : t(row.fsrs)
                      }
                      onSoft
                    />
                  </td>

                  <td className="px-5 py-4 text-center">
                    <CompareCell
                      value={STATIC_VALUES.has(row.sm2) ? row.sm2 : t(row.sm2)}
                    />
                  </td>

                  <td className="px-5 py-4 text-center">
                    <CompareCell
                      value={
                        STATIC_VALUES.has(row.leitner)
                          ? row.leitner
                          : t(row.leitner)
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
