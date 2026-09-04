import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { AuthGuard } from "@/components";
import { StudyPage } from "@/pages";

const searchSchema = z.object({
  deckId: z.string().optional(),
  mode: z.enum(["scheduled", "practice"]).optional().default("scheduled"),
});

export const Route = createFileRoute("/_app/study")({
  validateSearch: searchSchema,
  component: () => {
    const { deckId, mode } = Route.useSearch();
    return (
      <AuthGuard>
        <StudyPage deckId={deckId} mode={mode} />
      </AuthGuard>
    );
  },
});
