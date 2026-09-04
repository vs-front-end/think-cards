import { useCallback } from "react";
import { useNavigate } from "@tanstack/react-router";

export const useNavigateToStudy = () => {
  const navigate = useNavigate();

  return useCallback(
    (deckId: string, mode: "scheduled" | "practice" = "scheduled") => {
      navigate({ to: "/study", search: { deckId, mode } });
    },
    [navigate],
  );
};
