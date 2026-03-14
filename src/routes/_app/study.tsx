import { useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { StudySession } from "../../components/StudySession";
import { AuthGuard } from "@/components/AuthGuard";

const searchSchema = z.object({
  deckId: z.string().optional(),
});

export const Route = createFileRoute("/_app/study")({
  validateSearch: searchSchema,
  component: () => (
    <AuthGuard>
      <StudyComponent />
    </AuthGuard>
  ),
});

function StudyComponent() {
  const navigate = useNavigate();
  const { deckId } = Route.useSearch();

  useEffect(() => {
    if (!deckId) {
      navigate({ to: "/decks" });
    }
  }, [deckId, navigate]);

  if (!deckId) return null;

  return <StudySession deckId={deckId} />;
}
