import { useTranslation } from "react-i18next";
import { Card, Separator, Text } from "@stellar-ui-kit/web";

import {
  ProfileAvatar,
  PasswordManager,
  ThemeSelector,
  LanguageSelector,
  FeedbackSection,
  DangerZone,
  ProfileDailyGoal,
  ProfileUsername,
  LogoutSection,
} from "./components";

export const SettingsPage = () => {
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
        <section className="flex flex-col flex-1 gap-2">
          <Text as="h2" className="text-sm font-semibold text-foreground">
            {t("settingsSectionAccount")}
          </Text>

          <Card className="border border-border bg-surface p-4">
            <div className="flex w-full flex-col gap-4">
              <ProfileAvatar />
              <Separator variant="dashed" />

              <ProfileUsername />
              <Separator variant="dashed" />

              <PasswordManager />
              <Separator variant="dashed" />

              <DangerZone />
            </div>
          </Card>
        </section>

        <section className="flex flex-col flex-1 gap-2">
          <Text as="h2" className="text-sm font-semibold text-foreground">
            {t("settingsSectionPreferences")}
          </Text>

          <Card className="border border-border bg-surface p-4">
            <div className="flex w-full flex-col gap-4">
              <ProfileDailyGoal />
              <Separator variant="dashed" />

              <LanguageSelector />
              <Separator variant="dashed" />

              <ThemeSelector />
              <Separator variant="dashed" />

              <FeedbackSection />
              <Separator variant="dashed" />

              <LogoutSection />
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
};
