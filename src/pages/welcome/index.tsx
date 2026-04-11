import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Spinner } from "@stellar-ui-kit/web";
import { useAuthStore } from "@/store";
import { useDocumentHead } from "@/hooks";

import {
  CompareSection,
  CtaSection,
  FaqSection,
  FeaturesSection,
  HeroSection,
  HowItWorksSection,
  WelcomeFooter,
} from "./components";

export function WelcomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  useDocumentHead({
    title: t("welcomeSubtitle"),
    description: t("welcomeHeroDesc"),
  });

  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);

  useEffect(() => {
    if (!isLoading && user) {
      navigate({ to: "/dashboard" });
    }
  }, [isLoading, user, navigate]);

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Spinner className="size-12" />
      </div>
    );
  }

  if (user) return null;

  return (
    <div className="flex flex-1 flex-col">
      <HeroSection />
      <HowItWorksSection />
      <FeaturesSection />
      <CompareSection />
      <FaqSection />
      <CtaSection />
      <WelcomeFooter />
    </div>
  );
}
