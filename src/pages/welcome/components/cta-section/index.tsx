import { useTranslation } from "react-i18next";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@stellar-ui-kit/web";

export const CtaSection = () => {
  const { t } = useTranslation();

  return (
    <section className="w-full border-b border-border bg-surface">
      <div className="mx-auto max-w-7xl px-6 py-16 md:py-20">
        <div className="flex flex-col items-center justify-between gap-8 overflow-hidden rounded-2xl border border-border bg-primary px-10 py-12 text-center md:flex-row md:items-center md:text-left">
          <div className="flex flex-col gap-2 md:items-start">
            <h2
              className="text-white"
              style={{
                fontSize: "clamp(1.6rem, 3vw, 2.4rem)",
                fontWeight: 700,
                lineHeight: 1.1,
                letterSpacing: "-0.025em",
              }}
            >
              {t("welcomeCtaTitle")}
            </h2>

            <p
              className="text-sm leading-relaxed text-white"
              style={{ opacity: 0.75 }}
            >
              {t("welcomeCtaDesc")}
            </p>
          </div>

          <Link to="/auth/sign-up" className="shrink-0 mt-0 md:mt-3">
            <Button
              size="lg"
              className="gap-2 rounded-lg bg-white hover:bg-white"
            >
              <span className="font-medium text-primary">
                {t("welcomeCtaButton")}
              </span>
              <ArrowRight className="size-3.5 text-primary" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};
