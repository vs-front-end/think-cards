import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { AuthGuard } from "@/components/AuthGuard";
import { StudyPage } from "@/pages";

const searchSchema = z.object({
  deckId: z.string().optional(),
});

export const Route = createFileRoute("/_app/study")({
  validateSearch: searchSchema,
  component: () => {
    const { deckId } = Route.useSearch();
    return (
      <AuthGuard>
        <StudyPage deckId={deckId} />
      </AuthGuard>
    );
  },
});
