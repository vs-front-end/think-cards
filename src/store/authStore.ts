import { create } from "zustand";
import type { Session } from "@supabase/supabase-js";
import type { AuthUser } from "@/lib/auth-storage";

import {
  clearStoredAuthUser,
  getStoredAuthUser,
  normalizeAuthUser,
  storeAuthUser,
} from "@/lib/auth-storage";

type AuthStore = {
  user: AuthUser | null;
  session: Session | null;
  isLoading: boolean;
  setUser: (user: AuthUser) => void;
  setSession: (session: Session | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  logout: () => void;
};

const storedUser = getStoredAuthUser();

export const useAuthStore = create<AuthStore>()((set) => ({
  user: storedUser,
  session: null,
  isLoading: storedUser === null,
  setUser: (user) => {
    const normalizedUser = normalizeAuthUser(user);
    storeAuthUser(normalizedUser);
    set({ user: normalizedUser });
  },
  setSession: (session) => set({ session }),
  setIsLoading: (isLoading) => set({ isLoading }),
  logout: () => {
    clearStoredAuthUser();
    set({ user: null, session: null, isLoading: false });
  },
}));
