import { useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Spinner } from "@stellar-ui-kit/web";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store";

export const Route = createFileRoute("/auth/callback")({
  component: CallbackComponent,
});

function CallbackComponent() {
  const navigate = useNavigate();
  const { setUser, setSession, setIsLoading } = useAuthStore.getState();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSession(session);
        setUser(session.user);
        setIsLoading(false);
        navigate({ to: "/dashboard" });
      } else {
        setIsLoading(false);
        navigate({ to: "/" });
      }
    });
  }, [navigate]);

  return (
    <div className="flex flex-1 items-center justify-center">
      <Spinner />
    </div>
  );
}
