import { useState } from "react";
import { useTranslation } from "react-i18next";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { isNotEmpty, isValidEmail } from "@/utils/validation";
import { supabase } from "@/lib/supabase";
import { Card, InputText, Button, Spinner, Text } from "@stellar-ui-kit/web";
import { ArrowLeftIcon } from "lucide-react";

const ForgotPasswordComponent = () => {
  const { t } = useTranslation();

  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [authError, setAuthError] = useState("");
  const [sent, setSent] = useState(false);

  const resetMutation = useMutation({
    mutationFn: async (emailValue: string) => {
      const { error } = await supabase.auth.resetPasswordForEmail(emailValue, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      if (error) throw error;
    },
    onSuccess: () => setSent(true),
    onError: () => setAuthError(t("authErrorGeneric")),
  });

  const validateForm = (): boolean => {
    if (!isNotEmpty(email)) {
      setEmailError(t("signUpValidationEmailRequired"));
      return false;
    }

    if (!isValidEmail(email)) {
      setEmailError(t("signUpValidationEmailInvalid"));
      return false;
    }

    setEmailError("");
    return true;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;
    setAuthError("");
    resetMutation.mutate(email);
  };

  if (sent) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6 py-12">
        <Card className="w-full max-w-md p-6 md:p-8">
          <div className="space-y-2 text-center">
            <Text as="h2" className="mb-2">
              {t("forgotPasswordSuccessTitle")}
            </Text>

            <Text as="p" className="text-sm text-muted">
              {t("forgotPasswordSuccessMessage")}
            </Text>
          </div>

          <div className="space-y-5">
            <Link to="/auth/login">
              <Button className="w-full">
                <ArrowLeftIcon className="size-4" />
                {t("forgotPasswordBackToLogin")}
              </Button>
            </Link>

            <Button
              variant="ghost"
              size="sm"
              type="button"
              onClick={() => setSent(false)}
              className="w-full text-sm text-muted hover:bg-transparent hover:underline"
            >
              {t("forgotPasswordTryAgain")}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-12">
      <Card className="w-full max-w-md p-6 md:p-8">
        <div className="text-center">
          <Text as="h2" className="mb-2">
            {t("forgotPasswordTitle")}
          </Text>

          <Text as="p" className="text-sm text-muted">
            {t("forgotPasswordSubtitle")}
          </Text>
        </div>

        <div className="space-y-5">
          {authError && (
            <div className="rounded-md bg-error-soft px-4 py-3">
              <Text as="p" className="text-sm text-error-text">
                {authError}
              </Text>
            </div>
          )}

          <InputText
            type="email"
            label={t("signInEmailLabel")}
            placeholder={t("signInEmailPlaceholder")}
            value={email}
            onChange={(value) => {
              setEmail(value);
              setEmailError("");
              setAuthError("");
            }}
            error={emailError || undefined}
            containerClassName="w-full max-w-full"
          />

          <Button
            type="button"
            onClick={handleSubmit}
            disabled={resetMutation.isPending}
            className="w-full"
          >
            {resetMutation.isPending && (
              <Spinner className="size-4 text-white" />
            )}
            {t("forgotPasswordSubmitButton")}
          </Button>
        </div>

        <Link
          to="/auth/login"
          className="flex items-center justify-center gap-2 text-center text-sm text-muted hover:underline"
        >
          <ArrowLeftIcon className="size-4" /> {t("forgotPasswordBackToLogin")}
        </Link>
      </Card>
    </div>
  );
};

export const Route = createFileRoute("/auth/forgot-password")({
  component: ForgotPasswordComponent,
});
