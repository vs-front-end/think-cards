import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store";
import { compressImage } from "@/utils";

export type Profile = {
  id: string;
  username: string;
  avatar_url: string | null;
  daily_goal_default: number;
};

export const useProfile = () => {
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
