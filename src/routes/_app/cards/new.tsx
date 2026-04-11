import { createFileRoute, useSearch } from "@tanstack/react-router";
import { AuthGuard } from "@/components";
import { NewCardPage } from "@/pages";

export const Route = createFileRoute("/_app/cards/new")({
  validateSearch: (search: Record<string, unknown>) => ({
    deckId: typeof search.deckId === "string" ? search.deckId : undefined,
  }),

  component: () => {
    const { deckId } = useSearch({ from: "/_app/cards/new" });
    return (
      <AuthGuard>
        <NewCardPage deckId={deckId} />
      </AuthGuard>
    );
  },
});
