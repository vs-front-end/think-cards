import { SettingsPage } from "@/pages";
import { AuthGuard } from "@/components";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/settings")({
  component: () => (
    <AuthGuard>
      <SettingsPage />
    </AuthGuard>
  ),
});
