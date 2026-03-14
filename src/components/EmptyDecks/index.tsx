import { useTranslation } from "react-i18next";
import { Button, Text } from "@stellar-ui-kit/web";
import { Layers, Plus } from "lucide-react";

type EmptyDecksProps = {
  onCreateDeck: () => void;
};

export function EmptyDecks({ onCreateDeck }: EmptyDecksProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-border bg-surface/50 py-16 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-primary-soft text-primary">
        <Layers className="size-7" />
      </div>

      <div className="space-y-1">
        <Text as="h3" className="font-semibold">
          {t("dashboardNoDecksTitle")}
        </Text>

        <Text as="p" className="text-sm text-muted">
          {t("dashboardNoDecksDesc")}
        </Text>
      </div>

      <Button type="button" onClick={onCreateDeck} className="gap-1.5">
        <Plus className="size-4" />
        {t("dashboardCreateFirstDeck")}
      </Button>
    </div>
  );
}
