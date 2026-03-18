import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { isNotEmpty, isValidEmail, hasMinLength } from "@/utils/validation";
import { SocialAuthButtons } from "@/components";
import { useSignIn, useOAuthSignIn } from "@/hooks/useAuth";
import { useDocumentHead } from "@/hooks";
import type { AuthError } from "@supabase/supabase-js";

import {
  Card,
  InputText,
  InputPassword,
  Button,
  Spinner,
  Text,
  Separator,
} from "@stellar-ui-kit/web";

const PASSWORD_MIN_LENGTH = 6;

function getAuthErrorMessage(error: AuthError, t: (key: string) => string) {
  if (error.message.includes("Invalid login credentials")) {
    return t("authErrorInvalidCredentials");
  }

  return t("authErrorGeneric");
}

const LoginComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  useDocumentHead({ title: t("loginTitle") });

  const signIn = useSignIn();
  const oAuthSignIn = useOAuthSignIn();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  const [authError, setAuthError] = useState("");
  const [oAuthProvider, setOAuthProvider] = useState<string | null>(null);

  useEffect(() => {
    const reset = () => {
      if (document.visibilityState === "visible") setOAuthProvider(null);
    };
    
    document.addEventListener("visibilitychange", reset);
    return () => document.removeEventListener("visibilitychange", reset);
  }, []);

  const handleEmailChange = (value: string) => {
    setForm((prev) => ({ ...prev, email: value }));
    setErrors((prev) => ({ ...prev, email: "" }));
    setAuthError("");
  };

  const handlePasswordChange = (value: string) => {
    setForm((prev) => ({ ...prev, password: value }));
    setErrors((prev) => ({ ...prev, password: "" }));
    setAuthError("");
  };

  const validateForm = (): boolean => {
    const next = { email: "", password: "" };

    if (!isNotEmpty(form.email)) {
      next.email = t("loginValidationEmailRequired");
    } else if (!isValidEmail(form.email)) {
      next.email = t("loginValidationEmailInvalid");
    }

    if (!isNotEmpty(form.password)) {
      next.password = t("loginValidationPasswordRequired");
    } else if (!hasMinLength(form.password, PASSWORD_MIN_LENGTH)) {
      next.password = t("loginValidationPasswordMinLength", {
        count: PASSWORD_MIN_LENGTH,
      });
    }

    setErrors(next);
    return !next.email && !next.password;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    signIn.mutate(
      { email: form.email, password: form.password },
      {
        onSuccess: () => navigate({ to: "/dashboard" }),
        onError: (error) =>
          setAuthError(getAuthErrorMessage(error as AuthError, t)),
      },
    );
  };

  const handleOAuth = async (provider: "google" | "github" | "x") => {
    if (oAuthProvider !== null) return;

    setAuthError("");
    setOAuthProvider(provider);

    try {
      await oAuthSignIn(provider);
    } catch {
      setAuthError(t("authErrorGeneric"));
      setOAuthProvider(null);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-12">
      <Card className="w-full max-w-md p-6 md:p-8">
        <div className="text-center">
          <Text as="h2">{t("loginTitle")}</Text>
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
            label={t("loginEmailLabel")}
            placeholder={t("loginEmailPlaceholder")}
            value={form.email}
            onChange={handleEmailChange}
            error={errors.email || undefined}
            containerClassName="w-full max-w-full"
          />

          <InputPassword
            label={t("loginPasswordLabel")}
            placeholder={t("loginPasswordPlaceholder")}
            value={form.password}
            onChange={handlePasswordChange}
            error={errors.password || undefined}
            containerClassName="w-full max-w-full"
          />

          <div className="flex items-center justify-end">
            <Link
              to="/auth/forgot-password"
              className="text-sm font-medium text-muted hover:underline"
            >
              {t("loginForgotPassword")}
            </Link>
          </div>

          <Button
            type="button"
            onClick={handleSubmit}
            disabled={signIn.isPending || oAuthProvider !== null}
            className="w-full"
          >
            {signIn.isPending && <Spinner className="size-4 text-white" />}
            {t("loginSubmitButton")}
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
                {t("loginOrSignInWith")}
              </Text>
            </div>
          </div>

          <SocialAuthButtons
            handlers={{
              google: () => handleOAuth("google"),
              github: () => handleOAuth("github"),
              x: () => handleOAuth("x"),
            }}
            loadingProvider={oAuthProvider}
          />
        </div>

        <Link
          to="/auth/sign-up"
          className="text-center text-sm text-muted hover:underline"
        >
          {t("loginSignUpLink")}!
        </Link>
      </Card>
    </div>
  );
};

export const Route = createFileRoute("/auth/login")({
  component: LoginComponent,
});
