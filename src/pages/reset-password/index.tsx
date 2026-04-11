import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeftIcon, CheckCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

import {
  Button,
  Card,
  InputPassword,
  Spinner,
  Text,
} from "@stellar-ui-kit/web";

const PASSWORD_REQUIREMENTS = [
  /.{8,}/,
  /[a-z]/,
  /[A-Z]/,
  /[0-9]/,
  /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/,
];

type ResetState = "loading" | "ready" | "expired" | "success";

const parseHashError = (): boolean => {
  const hash = window.location.hash.substring(1);
  const params = new URLSearchParams(hash);
  return !!params.get("error");
};

export const ResetPasswordPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [state, setState] = useState<ResetState>("loading");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formError, setFormError] = useState("");

  const updateMutation = useMutation({
    mutationFn: async (newPassword: string) => {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;
    },
    onSuccess: () => setState("success"),
    onError: () => setFormError(t("resetPasswordErrorGeneric")),
  });

  const handleSubmit = () => {
    setFormError("");

    if (!PASSWORD_REQUIREMENTS.every((re) => re.test(password))) {
      setFormError(t("changePasswordErrorRequirements"));
      return;
    }

    if (password !== confirmPassword) {
      setFormError(t("changePasswordErrorMismatch"));
      return;
    }

    updateMutation.mutate(password);
  };

  useEffect(() => {
    if (parseHashError()) {
      setState("expired");
      return;
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setState("ready");
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setState("ready");
    });

    const timer = setTimeout(() => {
      setState((prev) => (prev === "loading" ? "expired" : prev));
    }, 15000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  if (state === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center px-6 py-12">
        <Spinner />
      </div>
    );
  }

  if (state === "expired") {
    return (
      <div className="flex min-h-screen items-center justify-center px-6 py-12">
        <Card className="w-full max-w-md p-6 md:p-8">
          <div className="space-y-2 text-center">
            <Text as="h2" className="mb-2">
              {t("resetPasswordExpiredTitle")}
            </Text>
            <Text as="p" className="text-sm text-muted">
              {t("resetPasswordExpiredMessage")}
            </Text>
          </div>

          <div className="space-y-3">
            <Link to="/auth/forgot-password">
              <Button className="w-full">{t("resetPasswordRequestNew")}</Button>
            </Link>

            <Link
              to="/auth/login"
              className="flex items-center justify-center gap-2 text-center text-sm text-muted hover:underline"
            >
              <ArrowLeftIcon className="size-4" />{" "}
              {t("forgotPasswordBackToLogin")}
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  if (state === "success") {
    return (
      <div className="flex min-h-screen items-center justify-center px-6 py-12">
        <Card className="w-full max-w-md p-6 md:p-8">
          <div className="flex flex-col items-center gap-2 text-center">
            <CheckCircle className="size-10 text-success" />
            <Text as="h2" className="mb-2">
              {t("resetPasswordSuccessTitle")}
            </Text>
            <Text as="p" className="text-sm text-muted">
              {t("resetPasswordSuccessMessage")}
            </Text>
          </div>

          <Button
            className="w-full"
            onClick={() => navigate({ to: "/dashboard" })}
          >
            {t("resetPasswordGoToDashboard")}
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-12">
      <Card className="w-full max-w-md p-6 md:p-8">
        <div className="text-center">
          <Text as="h2" className="mb-2">
            {t("resetPasswordTitle")}
          </Text>
          <Text as="p" className="text-sm text-muted">
            {t("resetPasswordSubtitle")}
          </Text>
        </div>

        <div className="space-y-5">
          {formError && (
            <div className="rounded-md bg-error-soft px-4 py-3">
              <Text as="p" className="text-sm text-error-text">
                {formError}
              </Text>
            </div>
          )}

          <InputPassword
            label={t("resetPasswordNewLabel")}
            placeholder="••••••••"
            value={password}
            onChange={(v) => {
              setPassword(v);
              setFormError("");
            }}
            containerClassName="w-full max-w-full"
          />

          <InputPassword
            label={t("resetPasswordConfirmLabel")}
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(v) => {
              setConfirmPassword(v);
              setFormError("");
            }}
            containerClassName="w-full max-w-full"
          />

          <Button
            type="button"
            onClick={handleSubmit}
            disabled={updateMutation.isPending}
            className="w-full"
          >
            {updateMutation.isPending && (
              <Spinner className="size-4 text-white" />
            )}
            {t("resetPasswordSubmitButton")}
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
