import { useTranslation } from "react-i18next";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Button, Text } from "@stellar-ui-kit/web";

export const Route = createFileRoute("/$")({
  component: NotFoundComponent,
});

function NotFoundComponent() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 p-8 text-center">
      <Text as="span" className="text-6xl font-bold text-muted">
        404
      </Text>

      <div className="flex flex-col gap-2">
        <Text as="h1" className="text-xl font-semibold">
          {t("notFoundTitle")}
        </Text>

        <Text as="p" className="text-sm text-muted">
          {t("notFoundDesc")}
        </Text>
      </div>

      <Link to="/">
        <Button variant="outline" size="sm">
          {t("notFoundBack")}
        </Button>
      </Link>
    </div>
  );
}
