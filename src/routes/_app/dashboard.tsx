import { createFileRoute } from "@tanstack/react-router";
import { AuthGuard } from "@/components";
import { DashboardPage } from "@/pages";

export const Route = createFileRoute("/_app/dashboard")({
  component: () => (
    <AuthGuard>
      <DashboardPage />
    </AuthGuard>
  ),
});
