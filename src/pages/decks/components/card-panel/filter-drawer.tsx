import { useTranslation } from "react-i18next";
import type { CardStatus } from "@/hooks/useCardsWithState";

import {
  Button,
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  InputSearch,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@stellar-ui-kit/web";

type CardTypeFilter = "all" | "basic" | "cloze" | "typing";
type StatusFilter = "all" | CardStatus;

type FilterDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  typeFilter: CardTypeFilter;
  statusFilter: StatusFilter;
  search: string;
  hasActiveFilters: boolean;
  onTypeFilterChange: (v: CardTypeFilter) => void;
  onStatusFilterChange: (v: StatusFilter) => void;
  onSearchChange: (v: string) => void;
  onClearFilters: () => void;
};

export const FilterDrawer = ({
  open,
  onOpenChange,
  typeFilter,
  statusFilter,
  search,
  hasActiveFilters,
  onTypeFilterChange,
  onStatusFilterChange,
  onSearchChange,
  onClearFilters,
}: FilterDrawerProps) => {
  const { t } = useTranslation();

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{t("cardPanelFilters")}</DrawerTitle>
        </DrawerHeader>

        <div className="flex flex-col gap-4 p-4 pb-8">
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-muted">
              {t("cardPanelFilterType")}
            </span>

            <Select
              value={typeFilter}
              onValueChange={(v) => onTypeFilterChange(v as CardTypeFilter)}
            >
              <SelectTrigger className="h-9 w-full text-sm">
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">{t("cardPanelAllTypes")}</SelectItem>
                <SelectItem value="basic">{t("cardPanelTypeBasic")}</SelectItem>
                <SelectItem value="cloze">{t("cardPanelTypeCloze")}</SelectItem>
                <SelectItem value="typing">
                  {t("cardPanelTypeTyping")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-muted">
              {t("cardPanelFilterStatus")}
            </span>

            <Select
              value={statusFilter}
              onValueChange={(v) => onStatusFilterChange(v as StatusFilter)}
            >
              <SelectTrigger className="h-9 w-full text-sm">
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">
                  {t("cardPanelAllStatuses")}
                </SelectItem>
                <SelectItem value="new">{t("cardPanelStatusNew")}</SelectItem>
                <SelectItem value="learning">
                  {t("cardPanelStatusLearning")}
                </SelectItem>
                <SelectItem value="review">
                  {t("cardPanelStatusReview")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-muted">
              {t("cardPanelFilterSearch")}
            </span>

            <InputSearch
              value={search}
              onChange={onSearchChange}
              placeholder={t("dashboardSearchDecks")}
            />
          </div>

          {hasActiveFilters && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="font-normal text-muted"
              onClick={onClearFilters}
            >
              {t("cardPanelClearFilters")}
            </Button>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
};
