import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { hasStoredSupabaseSession } from "@/lib/auth-storage";
import { useAuthStore } from "@/store";

export const useAuthListener = () => {
  const { logout, setUser, setSession, setIsLoading } =
    useAuthStore.getState();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        if (!session.user.email_confirmed_at) {
          setIsLoading(false);
          return;
        }

        setSession(session);
        setUser(session.user);
        setIsLoading(false);
        return;
      }

      if (event === "SIGNED_OUT") {
        logout();
        return;
      }

      if (event === "INITIAL_SESSION" && !hasStoredSupabaseSession()) {
        logout();
        return;
      }

      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);
};
