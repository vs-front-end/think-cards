import { type ReactNode, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Spinner } from "@stellar-ui-kit/web";
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
    return (
      <div className="flex flex-1 items-center justify-center">
        <Spinner className="size-12" />
      </div>
    );
  }

  if (!user) return null;

  return <>{children}</>;
};
