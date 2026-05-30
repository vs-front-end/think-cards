import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store";

export const useAuthListener = () => {
  const { setUser, setSession, setIsLoading } = useAuthStore.getState();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user.email_confirmed_at) {
        setSession(session);
        setUser(session.user);
      }

      setIsLoading(false);
    });

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

      if (event === "SIGNED_OUT" && navigator.onLine) {
        setSession(null);
        setUser(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);
};
