import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Text } from "@stellar-ui-kit/web";
import { SettingsSection } from "../../components/SettingsSection";
import { ProfileSection } from "../../components/ProfileSection";
import { AppearanceSection } from "../../components/AppearanceSection";
import { LanguageSection } from "../../components/LanguageSection";
import { StudySection } from "../../components/StudySection";
import { AccountSection } from "../../components/AccountSection";
import { AuthGuard } from "@/components/AuthGuard";

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

      <div className="grid flex-1 gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.5fr)]">
        <div className="flex flex-col gap-4">
          <SettingsSection title={t("settingsSectionProfile")}>
            <ProfileSection />
          </SettingsSection>

          <SettingsSection title={t("settingsSectionStudy")}>
            <StudySection />
          </SettingsSection>
        </div>

        <div className="flex flex-col gap-4">
          <SettingsSection title={t("settingsSectionAppearance")}>
            <AppearanceSection />
          </SettingsSection>

          <SettingsSection title={t("settingsSectionLanguage")}>
            <LanguageSection />
          </SettingsSection>

          <SettingsSection title={t("settingsSectionAccount")}>
            <AccountSection />
          </SettingsSection>
        </div>
      </div>
    </div>
  );
}
