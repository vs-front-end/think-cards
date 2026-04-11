import { createFileRoute } from "@tanstack/react-router";
import { AuthGuard } from "@/components";
import { DecksPage } from "@/pages";

export const Route = createFileRoute("/_app/decks")({
  component: () => (
    <AuthGuard>
      <DecksPage />
    </AuthGuard>
  ),
});
