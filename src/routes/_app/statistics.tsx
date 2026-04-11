import { createFileRoute } from "@tanstack/react-router";
import { AuthGuard } from "@/components";
import { StatisticsPage } from "@/pages";

export const Route = createFileRoute("/_app/statistics")({
  component: () => (
    <AuthGuard>
      <StatisticsPage />
    </AuthGuard>
  ),
});
