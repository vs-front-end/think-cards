import { useState } from "react";
import { useTranslation } from "react-i18next";
import { createFileRoute, Link } from "@tanstack/react-router";
import { isNotEmpty, isValidEmail } from "@/utils/validation";
import { SocialAuthButtons } from "@/components";
import { useSignUp, useOAuthSignIn } from "@/hooks/useAuth";
import { useDocumentHead } from "@/hooks";
import type { AuthError } from "@supabase/supabase-js";

import {
  Card,
  InputText,
  InputPassword,
  Button,
  Checkbox,
  Spinner,
  Text,
  Separator,
  Label,
} from "@stellar-ui-kit/web";

const PASSWORD_REQUIREMENTS = [
  /.{8,}/,
  /[a-z]/,
  /[A-Z]/,
  /[0-9]/,
  /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/,
];

const SignUpComponent = () => {
  const { t } = useTranslation();

  useDocumentHead({ title: t("signInTitle") });

  const signUp = useSignUp();
  const oAuthSignIn = useOAuthSignIn();

  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    termsAccepted: false,
  });

  const [errors, setErrors] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    terms: "",
  });

  const [authError, setAuthError] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [isOAuthLoading, setIsOAuthLoading] = useState(false);

  const handleEmailChange = (value: string) => {
    setForm((prev) => ({ ...prev, email: value }));
    setErrors((prev) => ({ ...prev, email: "" }));
    setAuthError("");
  };

  const handlePasswordChange = (value: string) => {
    setForm((prev) => ({ ...prev, password: value }));
    setErrors((prev) => ({ ...prev, password: "" }));
  };

  const handleConfirmPasswordChange = (value: string) => {
    setForm((prev) => ({ ...prev, confirmPassword: value }));
    setErrors((prev) => ({ ...prev, confirmPassword: "" }));
  };

  const validateForm = (): boolean => {
    const next = { email: "", password: "", confirmPassword: "", terms: "" };

    if (!isNotEmpty(form.email)) {
      next.email = t("signUpValidationEmailRequired");
    } else if (!isValidEmail(form.email)) {
      next.email = t("signUpValidationEmailInvalid");
    }

    if (!isNotEmpty(form.password)) {
      next.password = t("signUpValidationPasswordRequired");
    } else if (!PASSWORD_REQUIREMENTS.every((re) => re.test(form.password))) {
      next.password = t("signUpValidationPasswordRequirements");
    }

    if (!isNotEmpty(form.confirmPassword)) {
      next.confirmPassword = t("signUpValidationConfirmPasswordRequired");
    } else if (form.password !== form.confirmPassword) {
      next.confirmPassword = t("signUpValidationPasswordMismatch");
    }

    if (!form.termsAccepted) {
      next.terms = t("signUpTermsRequired");
    }

    setErrors(next);
    return (
      !next.email && !next.password && !next.confirmPassword && !next.terms
    );
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    signUp.mutate(
      { email: form.email, password: form.password },
      {
        onSuccess: () => setEmailSent(true),
        onError: (error) => {
          const authErr = error as AuthError;
          if (authErr.message.includes("already registered")) {
            setAuthError(t("authErrorEmailInUse"));
          } else {
            setAuthError(t("authErrorGeneric"));
          }
        },
      },
    );
  };

  const handleOAuth = async (provider: "google" | "github" | "x") => {
    if (isOAuthLoading) return;

    setAuthError("");
    setIsOAuthLoading(true);

    try {
      await oAuthSignIn(provider);
    } catch {
      setAuthError(t("authErrorGeneric"));
      setIsOAuthLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6 py-12">
        <Card className="w-full max-w-md p-6 md:p-8">
          <div className="space-y-2 text-center">
            <Text as="h2">{t("signUpSuccessTitle")}</Text>
            <Text as="p" className="text-sm text-muted">
              {t("signUpSuccessMessage", { email: form.email })}
            </Text>
          </div>

          <Link to="/auth/login">
            <Button className="w-full">{t("forgotPasswordBackToLogin")}</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-12">
      <Card className="w-full max-w-md p-6 md:p-8">
        <div className="text-center">
          <Text as="h2">{t("signInTitle")}</Text>
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
            value={form.email}
            onChange={handleEmailChange}
            error={errors.email || undefined}
            containerClassName="w-full max-w-full"
          />

          <InputPassword
            label={t("signInPasswordLabel")}
            placeholder={t("signInPasswordPlaceholder")}
            value={form.password}
            onChange={handlePasswordChange}
            error={errors.password || undefined}
            containerClassName="w-full max-w-full"
          />

          <InputPassword
            label={t("signInConfirmPasswordLabel")}
            placeholder={t("signInConfirmPasswordPlaceholder")}
            value={form.confirmPassword}
            onChange={handleConfirmPasswordChange}
            error={errors.confirmPassword || undefined}
            containerClassName="w-full max-w-full"
          />

          <div className="space-y-1">
            <div className="flex items-start gap-2">
              <Checkbox
                id="terms"
                checked={form.termsAccepted}
                onCheckedChange={(checked) => {
                  setForm((prev) => ({
                    ...prev,
                    termsAccepted: checked === true,
                  }));
                  setErrors((prev) => ({ ...prev, terms: "" }));
                }}
              />

              <Label
                htmlFor="terms"
                className="cursor-pointer text-sm text-muted"
              >
                <Text as="p" className="text-sm text-muted">
                  {t("signUpTermsLabel")}{" "}
                  <a
                    href="/legal/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-foreground underline"
                  >
                    {t("signUpTermsPrivacyLink")}
                  </a>
                </Text>
              </Label>
            </div>

            {errors.terms && (
              <Text as="p" className="text-xs text-error-text">
                {errors.terms}
              </Text>
            )}
          </div>

          <Button
            type="button"
            onClick={handleSubmit}
            disabled={signUp.isPending}
            className="w-full"
          >
            {signUp.isPending && <Spinner className="size-4 text-white" />}
            {t("signInSubmitButton")}
          </Button>
        </div>

        <div className="mt-3">
          <div className="relative mb-6">
            <Separator />
            <div className="absolute inset-0 flex items-center justify-center">
              <Text
                as="span"
                className="bg-surface px-2 text-xs uppercase text-muted"
              >
                {t("signInOrSignUpWith")}
              </Text>
            </div>
          </div>

          <SocialAuthButtons
            handlers={{
              google: () => handleOAuth("google"),
              github: () => handleOAuth("github"),
              twitter: () => handleOAuth("x"),
            }}
            isLoading={isOAuthLoading}
          />
        </div>

        <Link
          to="/auth/login"
          className="block text-center text-sm text-muted hover:underline"
        >
          {t("signInHasAccountLink")}!
        </Link>
      </Card>
    </div>
  );
};

export const Route = createFileRoute("/auth/sign-up")({
  component: SignUpComponent,
});
