import { useTranslation } from "react-i18next";
import { useNavigate } from "@tanstack/react-router";
import { Button, Text } from "@stellar-ui-kit/web";
import { PartyPopper } from "lucide-react";

export const EmptyDeck = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-12 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-success-soft text-success">
        <PartyPopper className="size-7" />
      </div>

      <div className="space-y-1">
        <Text as="h2" className="text-xl font-semibold">
          {t("studyNoCardsTitle")}
        </Text>

        <Text as="p" className="text-sm text-muted">
          {t("studyNoCardsDesc")}
        </Text>
      </div>

      <Button type="button" onClick={() => navigate({ to: "/dashboard" })}>
        {t("studyBackToDashboard")}
      </Button>
    </div>
  );
};
