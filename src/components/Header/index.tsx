import { useTranslation } from "react-i18next";
import { Link } from "@tanstack/react-router";
import { Button, Text } from "@stellar-ui-kit/web";

export const Header = () => {
  const { t } = useTranslation();

  return (
    <header className="border-b border-border bg-background px-4">
      <div className="mx-auto flex w-full max-w-4xl items-center justify-between gap-4 py-4">
        <Link
          to="/"
          className="flex items-center transition-transform duration-200 hover:scale-105"
        >
          <Text as="span" className="text-xl font-semibold md:text-2xl">
            Think
            <Text as="span" className="text-primary">
              Cards
            </Text>
          </Text>
        </Link>

        <div className="flex items-center gap-2">
          <Link to="/auth/login">
            <Button type="button" variant="ghost" size="sm">
              {t("headerLogin")}
            </Button>
          </Link>

          <Link to="/auth/sign-up">
            <Button type="button" size="sm">
              {t("headerSignUp")}
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};
