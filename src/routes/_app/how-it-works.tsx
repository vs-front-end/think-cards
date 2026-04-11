import { createFileRoute } from "@tanstack/react-router";
import { AuthGuard } from "@/components/AuthGuard";
import { HowItWorksPage } from "@/pages";

export const Route = createFileRoute("/_app/how-it-works")({
  component: () => (
    <AuthGuard>
      <HowItWorksPage />
    </AuthGuard>
  ),
});
