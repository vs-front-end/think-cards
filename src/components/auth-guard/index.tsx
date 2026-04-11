import { type ReactNode, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Loader } from "@/components/loader";
import { useAuthStore } from "@/store";

type Props = {
  children: ReactNode;
};

export const AuthGuard = ({ children }: Props) => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate({ to: "/" });
    }
  }, [user, isLoading]);

  if (isLoading) {
    return <Loader />;
  }

  if (!user) return null;

  return <>{children}</>;
};
