import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Separator, Text } from "@stellar-ui-kit/web";
import { AuthGuard } from "@/components/AuthGuard";
import { FeedbackSection } from "@/components/FeedbackSection";
import { SettingsSection } from "../../components/SettingsSection";
import { AccountSection } from "../../components/AccountSection";
import { AppearanceSection } from "../../components/AppearanceSection";
import { LanguageSection } from "../../components/LanguageSection";
import { StudySection } from "../../components/StudySection";

export const Route = createFileRoute("/_app/settings")({
  component: () => (
    <AuthGuard>
      <SettingsComponent />
    </AuthGuard>
  ),
});

function SettingsComponent() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-1 flex-col px-4 pt-6 pb-20 md:px-6 md:py-8">
      <div className="mb-6">
        <Text
          as="h1"
          className="text-2xl font-semibold tracking-tight md:text-3xl"
        >
          {t("settingsTitle")}
        </Text>

        <Text as="p" styleVariant="muted" className="mt-1 text-sm">
          {t("settingsSubtitle")}
        </Text>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row">
        <SettingsSection title={t("settingsSectionAccount")}>
          <AccountSection />
        </SettingsSection>

        <SettingsSection title={t("settingsSectionPreferences")}>
          <StudySection />
          <Separator />
          <AppearanceSection />
          <Separator />
          <LanguageSection />
          <Separator />
          <FeedbackSection />
        </SettingsSection>
      </div>
    </div>
  );
}
