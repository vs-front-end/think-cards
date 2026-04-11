import { createFileRoute, useParams } from "@tanstack/react-router";
import { AuthGuard } from "@/components";
import { EditCardPage } from "@/pages";

export const Route = createFileRoute("/_app/cards/$cardId/edit")({
  component: () => {
    const { cardId } = useParams({ from: "/_app/cards/$cardId/edit" });

    return (
      <AuthGuard>
        <EditCardPage cardId={cardId} />
      </AuthGuard>
    );
  },
});
