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

const fetchProfile = async (userId: string): Promise<Profile | null> => {
  if (navigator.onLine) {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (!error && data) {
      const profile = data as Profile;
      if (profile.id) await db.profile_cache.put(profile);
      return profile;
    }
  }

  return (await db.profile_cache.get(userId)) ?? null;
};

export const fetchDailyGoalDefault = async (
  userId: string | null,
): Promise<{ data: { daily_goal_default: number } | null }> => {
  if (!userId) return { data: null };

  const profile = await fetchProfile(userId);
  return {
    data: profile ? { daily_goal_default: profile.daily_goal_default } : null,
  };
};

export const useProfile = () => {
  const userId = useAuthStore((s) => s.user?.id);

  return useQuery<Profile | null>({
    queryKey: ["profile", userId],
    queryFn: () => (userId ? fetchProfile(userId) : Promise.resolve(null)),
    enabled: !!userId,
  });
};

export const useUpdateProfile = () => {
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
};

export const useUploadAvatar = () => {
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
};
