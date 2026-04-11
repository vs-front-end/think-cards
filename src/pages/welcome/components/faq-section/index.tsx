import { useTranslation } from "react-i18next";
import { cn } from "@stellar-ui-kit/shared";

const FAQ = [
  { q: "welcomeFaq1Q", a: "welcomeFaq1A" },
  { q: "welcomeFaq2Q", a: "welcomeFaq2A" },
  { q: "welcomeFaq3Q", a: "welcomeFaq3A" },
  { q: "welcomeFaq4Q", a: "welcomeFaq4A" },
  { q: "welcomeFaq5Q", a: "welcomeFaq5A" },
  { q: "welcomeFaq6Q", a: "welcomeFaq6A" },
];

export const FaqSection = () => {
  const { t } = useTranslation();

  return (
    <section className="w-full border-b border-border">
      <div className="mx-auto max-w-7xl px-6 py-14 md:py-16">
        <h2
          className="text-center text-foreground md:text-left"
          style={{
            fontSize: "clamp(1.5rem, 2.5vw, 2.25rem)",
            fontWeight: 700,
            letterSpacing: "-0.025em",
          }}
        >
          {t("welcomeFaqTitle")}
        </h2>

        <p className="mt-2 mb-10 text-center text-sm text-muted md:text-left">
          {t("welcomeFaqSubtitle")}
        </p>

        <div className="grid gap-0 overflow-hidden rounded-xl border border-border md:grid-cols-2">
          {FAQ.map(({ q, a }, i) => (
            <div
              key={q}
              className={cn(
                "flex flex-col gap-2 border-b border-border p-6 text-center md:text-left",
                i % 2 === 0 && "md:border-r",
                i >= FAQ.length - 2 && "md:border-b-0",
                i === FAQ.length - 1 && "border-b-0",
              )}
            >
              <h3 className="text-sm font-semibold leading-snug text-foreground">
                {t(q)}
              </h3>

              <p className="text-sm leading-relaxed text-muted">{t(a)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
