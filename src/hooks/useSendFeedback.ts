import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

type FeedbackCategory = "bug" | "suggestion" | "other";

export const useSendFeedback = () =>
  useMutation({
    mutationFn: async (input: { category: FeedbackCategory; message: string }) => {
      const { error } = await supabase.functions.invoke("send-feedback-email", {
        body: { category: input.category, message: input.message.trim() },
      });

      if (error) throw error;
    },
  });
