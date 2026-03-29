import { LogOut } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button, Text } from "@stellar-ui-kit/web";
import { useSignOut } from "@/hooks";

export const LogoutSection = () => {
  const { t } = useTranslation();
  const handleSignOut = useSignOut();

  return (
    <div className="flex flex-col gap-3">
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <Text as="p" className="text-sm font-semibold">
          {t("settingsSectionSession")}
        </Text>
        <Text as="p" className="text-xs text-muted">
          {t("settingsSessionDesc")}
        </Text>
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={() => handleSignOut()}
        className="w-full gap-2 text-muted"
      >
        <LogOut className="size-4" />
        {t("settingsLogout")}
      </Button>
    </div>
  );
};
