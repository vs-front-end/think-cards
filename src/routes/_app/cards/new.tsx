import { createFileRoute, useSearch } from "@tanstack/react-router";
import { AuthGuard } from "@/components/AuthGuard";
import { CardForm } from "@/components";

export const Route = createFileRoute("/_app/cards/new")({
  validateSearch: (search: Record<string, unknown>) => ({
    deckId: typeof search.deckId === "string" ? search.deckId : undefined,
  }),
  component: () => (
    <AuthGuard>
      <NewCardPage />
    </AuthGuard>
  ),
});

function NewCardPage() {
  const { deckId } = useSearch({ from: "/_app/cards/new" });
  return <CardForm defaultDeckId={deckId} />;
}
