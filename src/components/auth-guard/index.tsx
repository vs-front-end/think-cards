import { type ReactNode, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Loader } from "@/components/loader";
import { useAuthStore, useSyncStore } from "@/store";

type Props = {
  children: ReactNode;
};

export const AuthGuard = ({ children }: Props) => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);
  const initialSyncDone = useSyncStore((s) => s.initialSyncDone);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate({ to: "/" });
    }
  }, [user, isLoading]);

  if (isLoading || (user && !initialSyncDone)) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-background">
        <Loader className="flex-1" />
      </div>
    );
  }

  if (!user) return null;

  return <>{children}</>;
};
