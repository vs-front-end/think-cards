import { createFileRoute } from "@tanstack/react-router";
import { AuthGuard } from "@/components";
import { GenerateCardsPage } from "@/pages";

export const Route = createFileRoute("/_app/generate-cards")({
  component: () => (
    <AuthGuard>
      <GenerateCardsPage />
    </AuthGuard>
  ),
});
