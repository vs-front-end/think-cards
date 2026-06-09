import { useTranslation } from "react-i18next";
import { Link } from "@tanstack/react-router";
import { Button, Text } from "@stellar-ui-kit/web";

export const Header = () => {
  const { t } = useTranslation();

  return (
    <header className="w-full border-b border-border bg-background">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 max-[374px]:justify-center md:px-6">
        <Link to="/" className="flex items-center">
          <Text
            as="span"
            className="text-xl md:text-2xl font-bold tracking-tight text-foreground"
          >
            Think
            <Text as="span" className="text-primary">
              Cards
            </Text>
          </Text>
        </Link>

        <nav
          aria-label="Main navigation"
          className="flex items-center gap-2 max-[374px]:hidden"
        >
          <Link to="/auth/login">
            <Button
              type="button"
              variant="ghost"
              className="h-7 rounded-lg font-normal"
            >
              {t("headerLogin")}
            </Button>
          </Link>

          <Link to="/auth/sign-up">
            <Button type="button" className="h-7 rounded-lg font-normal">
              {t("headerSignUp")}
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  );
};
