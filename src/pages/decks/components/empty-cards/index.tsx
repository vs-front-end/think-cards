import { useTranslation } from "react-i18next";
import { LayoutList, MoreVertical, Plus } from "lucide-react";
import { Button, Text } from "@stellar-ui-kit/web";

type EmptyCardsProps = {
  onCreateCard: () => void;
  hasSearch: boolean;
};

export const EmptyCards = ({ onCreateCard, hasSearch }: EmptyCardsProps) => {
  const { t } = useTranslation();

  if (hasSearch) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
        <MoreVertical className="size-8 text-muted" />
        <Text as="p" className="text-sm text-muted">
          {t("emptyCardsSearch")}
        </Text>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
      <LayoutList className="size-10 text-muted" />

      <div className="space-y-1">
        <Text as="h3" className="font-semibold">
          {t("emptyCardsTitle")}
        </Text>

        <Text as="p" className="text-sm text-muted">
          {t("emptyCardsDesc")}
        </Text>
      </div>

      <Button
        type="button"
        size="sm"
        onClick={onCreateCard}
        className="gap-1.5 font-normal"
      >
        <Plus className="size-3.5" />
        {t("emptyCardsButton")}
      </Button>
    </div>
  );
};
