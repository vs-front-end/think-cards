import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Button, Text } from "@stellar-ui-kit/web";

type ErrorBoundaryState = { hasError: boolean };

const ErrorFallback = () => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <Text as="h2" className="text-xl font-semibold">
        {t("errorTitle")}
      </Text>

      <Text as="p" className="text-sm text-muted">
        {t("errorDesc")}
      </Text>

      <Button type="button" onClick={() => window.location.reload()}>
        {t("errorReload")}
      </Button>
    </div>
  );
};

export class ErrorBoundary extends Component<
  { children: ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Uncaught error:", error, info);
  }

  override render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }

    return this.props.children;
  }
}
