import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { clearLocalDb } from "@/lib/db";
import { useAuthStore } from "@/store";
import { resetSyncState } from "@/hooks/useSync";
import type { Provider } from "@supabase/supabase-js";

export const useSession = () => {
  return useAuthStore((s) => s.session);
};

export const useSignIn = () => {
  return useMutation({
    mutationFn: async ({
      email,
      password,
    }: {
      email: string;
      password: string;
    }) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return data;
    },
  });
};

export const useSignUp = () => {
  return useMutation({
    mutationFn: async ({
      email,
      password,
    }: {
      email: string;
      password: string;
    }) => {
      const { data, error } = await supabase.auth.signUp({ email, password });

      if (error) throw error;
      return data;
    },
  });
};

export const useSignOut = () => {
  const logout = useAuthStore((s) => s.logout);

  return async () => {
    resetSyncState();
    await supabase.auth.signOut({ scope: "global" });
    await clearLocalDb();
    logout();
  };
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: async ({
      currentPassword,
      newPassword,
      email,
    }: {
      currentPassword: string;
      newPassword: string;
      email: string;
    }) => {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: currentPassword,
      });

      if (signInError) throw new Error("wrongCurrentPassword");

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;
    },
  });
};

export const useSetPassword = () => {
  return useMutation({
    mutationFn: async ({ newPassword }: { newPassword: string }) => {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;
    },
  });
};

export const useOAuthSignIn = () => {
  return async (provider: Provider) => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) throw error;
  };
};
