import { useTranslation } from "react-i18next";
import { cn } from "@stellar-ui-kit/shared";

const STEPS = [
  {
    number: "01",
    title: "welcomeStep01Title",
    description: "welcomeStep01Desc",
  },
  {
    number: "02",
    title: "welcomeStep02Title",
    description: "welcomeStep02Desc",
  },
  {
    number: "03",
    title: "welcomeStep03Title",
    description: "welcomeStep03Desc",
  },
];

export const HowItWorksSection = () => {
  const { t } = useTranslation();

  return (
    <section className="w-full border-b border-border bg-surface">
      <div className="mx-auto max-w-7xl px-6 py-14 md:py-16">
        <h2
          className="mb-10 text-center text-foreground md:text-left"
          style={{
            fontSize: "clamp(1.5rem, 2.5vw, 2.25rem)",
            fontWeight: 700,
            letterSpacing: "-0.025em",
          }}
        >
          {t("welcomeHowItWorksTitle")}
        </h2>

        <div className="grid gap-0 overflow-hidden rounded-xl border border-border md:grid-cols-3">
          {STEPS.map((step, i) => (
            <div
              key={step.number}
              className={cn(
                "flex flex-col gap-4 p-8 text-center md:text-left",
                i < 2 && "border-b border-border md:border-b-0 md:border-r",
              )}
            >
              <span
                className="font-mono font-bold text-primary"
                style={{ fontSize: "2rem", lineHeight: 1 }}
              >
                {step.number}
              </span>

              <h3 className="text-base font-semibold text-foreground">
                {t(step.title)}
              </h3>

              <p className="text-sm leading-relaxed text-muted">
                {t(step.description)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
