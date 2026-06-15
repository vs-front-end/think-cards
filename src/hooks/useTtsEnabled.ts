import { useAuthStore } from "@/store";

const allowedEmails = (import.meta.env.VITE_TTS_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export const useTtsEnabled = (): boolean => {
  const email = useAuthStore((s) => s.user?.email);
  return !!email && allowedEmails.includes(email.toLowerCase());
};
