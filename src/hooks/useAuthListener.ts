import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { clearLocalDb } from "@/lib/db";
import { useAuthStore } from "@/store";

export const useAuthListener = () => {
  const { setUser, setSession, setIsLoading } = useAuthStore.getState();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        clearLocalDb();
        setSession(null);
        setUser(null);
        setIsLoading(false);
        return;
      }

      if (!session.user.email_confirmed_at) {
        setIsLoading(false);
        return;
      }

      setSession(session);
      setUser(session.user);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);
};
