import { useEffect } from "react";
import { createFileRoute, useParams, useNavigate } from "@tanstack/react-router";
import { AuthGuard } from "@/components/AuthGuard";
import { CardForm } from "@/components/CardForm";
import { useCardById } from "@/hooks";
import { Spinner } from "@stellar-ui-kit/web";

export const Route = createFileRoute("/_app/cards/$cardId/edit")({
  component: () => (
    <AuthGuard>
      <EditCardPage />
    </AuthGuard>
  ),
});

function EditCardPage() {
  const { cardId } = useParams({ from: "/_app/cards/$cardId/edit" });
  const navigate = useNavigate();
  const { data: card, isLoading } = useCardById(cardId);

  useEffect(() => {
    if (!isLoading && !card) {
      navigate({ to: "/decks" });
    }
  }, [isLoading, card, navigate]);

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!card) return null;

  return <CardForm card={card} />;
}
