import { useTranslation } from "react-i18next";
import { Button, Card, Text } from "@stellar-ui-kit/web";
import { DownloadIcon, X } from "lucide-react";
import { usePwaInstall } from "@/hooks";

type IInstallPromptProps = {
  visible?: boolean;
};

export function InstallPrompt({ visible = true }: IInstallPromptProps) {
  const { t } = useTranslation();
  const { canInstall, install, dismiss } = usePwaInstall();

  if (!visible || !canInstall) return null;

  return (
    <Card className="border border-border bg-surface px-5 py-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <div className="flex size-12 md:size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg">
            <img src="/icons/logo.svg" alt="ThinkCards" className="size-full" />
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <Text as="p" className="text-sm font-semibold">
              {t("installTitle")}
            </Text>

            <Text as="p" className="text-xs text-muted">
              {t("installDesc")}
            </Text>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button onClick={install} size="sm" className="flex-1 md:w-auto">
            <DownloadIcon className="size-3.5" />
            <span className="md:hidden">{t("installButton")}</span>
          </Button>

          <Button variant="outline" onClick={dismiss} size="sm">
            <X className="size-3.5" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
