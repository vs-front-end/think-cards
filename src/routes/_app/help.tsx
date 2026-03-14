import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Separator, Text } from "@stellar-ui-kit/web";
import { cn } from "@stellar-ui-kit/shared";
import { AuthGuard } from "@/components/AuthGuard";

export const Route = createFileRoute("/_app/help")({
  component: () => (
    <AuthGuard>
      <HelpComponent />
    </AuthGuard>
  ),
});

const RATING_KEYS = [
  {
    labelKey: "studyRatingAgain",
    descKey: "helpRatingAgainDesc",
    className: "bg-error-soft text-error-text",
  },
  {
    labelKey: "studyRatingHard",
    descKey: "helpRatingHardDesc",
    className: "bg-warning-soft text-warning-text",
  },
  {
    labelKey: "studyRatingGood",
    descKey: "helpRatingGoodDesc",
    className: "bg-primary-soft text-primary-text",
  },
  {
    labelKey: "studyRatingEasy",
    descKey: "helpRatingEasyDesc",
    className: "bg-success-soft text-success-text",
  },
] as const;

const CARD_TYPE_KEYS = [
  { nameKey: "cardRowTypeBasic", descKey: "helpCardTypeBasicDesc" },
  { nameKey: "cardRowTypeCloze", descKey: "helpCardTypeClozeDesc" },
  { nameKey: "cardRowTypeTyping", descKey: "helpCardTypeTypingDesc" },
] as const;

const TIP_KEYS = ["helpTip1", "helpTip2", "helpTip3", "helpTip4"] as const;

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <Text as="h2" className="text-lg font-semibold text-foreground">
      {children}
    </Text>
  );
}

function HelpComponent() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-1 flex-col px-4 pt-6 pb-20 md:px-6 md:py-8">
      <div className="mb-6">
        <Text
          as="h1"
          className="text-2xl font-semibold tracking-tight md:text-3xl"
        >
          {t("helpTitle")}
        </Text>

        <Text as="p" className="mt-1 text-sm text-muted">
          {t("helpSubtitle")}
        </Text>
      </div>

      <div className="flex flex-col gap-8">
        <section className="flex flex-col gap-3">
          <SectionHeading>{t("helpFsrsTitle")}</SectionHeading>
          <Separator />
          <Text as="p" className="text-sm leading-relaxed text-foreground">
            {t("helpFsrsDesc")}
          </Text>
        </section>

        <section className="flex flex-col gap-3">
          <SectionHeading>{t("helpRatingsTitle")}</SectionHeading>

          <Separator />

          <div className="flex flex-col gap-3">
            {RATING_KEYS.map(({ labelKey, descKey, className }) => (
              <div key={labelKey} className="flex items-start gap-3">
                <span
                  className={cn(
                    "inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                    className,
                  )}
                >
                  {t(labelKey)}
                </span>

                <Text as="p" className="text-sm text-foreground">
                  {t(descKey)}
                </Text>
              </div>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <SectionHeading>{t("helpTipsTitle")}</SectionHeading>

          <Separator />

          <ul className="flex flex-col gap-2">
            {TIP_KEYS.map((tipKey) => (
              <li key={tipKey} className="flex items-start gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                <Text as="p" className="text-sm text-foreground">
                  {t(tipKey)}
                </Text>
              </li>
            ))}
          </ul>
        </section>

        <section className="flex flex-col gap-3">
          <SectionHeading>{t("helpCardTypesTitle")}</SectionHeading>

          <Separator />

          <div className="flex flex-col gap-4">
            {CARD_TYPE_KEYS.map(({ nameKey, descKey }) => (
              <div key={nameKey} className="flex flex-col gap-1">
                <Text as="p" className="text-sm font-semibold text-foreground">
                  {t(nameKey)}
                </Text>
                <Text as="p" className="text-sm text-muted">
                  {t(descKey)}
                </Text>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
