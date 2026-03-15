import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { db } from "@/lib/db";
import { useAuthStore } from "@/store";
import { compressImage } from "@/utils";

export type Profile = {
  id: string;
  username: string;
  avatar_url: string | null;
  daily_goal_default: number;
};

export function useProfile() {
  const userId = useAuthStore((s) => s.user?.id);

  return useQuery<Profile | null>({
    queryKey: ["profile", userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      if (error) throw error;
      return data as Profile;
    },
    enabled: !!userId,
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (updates: Partial<Omit<Profile, "id">>) => {
      const userId = useAuthStore.getState().user?.id;
      if (!userId) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", userId);

      if (error) throw error;

      return userId;
    },

    onSuccess: (userId) => {
      qc.invalidateQueries({ queryKey: ["profile", userId] });
    },
  });
}

export function useUploadAvatar() {
  const updateProfile = useUpdateProfile();

  return useMutation({
    mutationFn: async (file: File) => {
      const userId = useAuthStore.getState().user?.id;
      if (!userId) throw new Error("Not authenticated");

      const compressed = await compressImage(file);
      const ext = compressed.name.split(".").pop() ?? "webp";
      const path = `${userId}/avatar.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, compressed, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      const avatarUrl = `${data.publicUrl}?t=${Date.now()}`;

      await updateProfile.mutateAsync({ avatar_url: avatarUrl });

      return avatarUrl;
    },
  });
}

export function useDeleteAccount() {
  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.functions.invoke("delete-account");
      if (error) throw error;

      await Promise.all([
        db.decks.clear(),
        db.cards.clear(),
        db.card_state.clear(),
        db.revlog.clear(),
        db.session_log.clear(),
        db.sync_meta.clear(),
      ]);

      await supabase.auth.signOut();
      useAuthStore.getState().logout();
    },
  });
}

export function useResetData() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const deckIds = await supabase
        .from("decks")
        .select("id")
        .eq("user_id", user.id)
        .then(({ data }) => (data ?? []).map((d) => d.id));

      if (deckIds.length > 0) {
        const cardIds = await supabase
          .from("cards")
          .select("id")
          .in("deck_id", deckIds)
          .then(({ data }) => (data ?? []).map((c) => c.id));

        if (cardIds.length > 0) {
          await supabase.from("revlog").delete().in("card_id", cardIds);
          await supabase.from("card_state").delete().in("card_id", cardIds);
        }

        await supabase.from("session_log").delete().in("deck_id", deckIds);
        await supabase.from("cards").delete().in("deck_id", deckIds);
      }

      await supabase.from("decks").delete().eq("user_id", user.id);

      await Promise.all([
        db.decks.clear(),
        db.cards.clear(),
        db.card_state.clear(),
        db.revlog.clear(),
        db.session_log.clear(),
      ]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });
}
