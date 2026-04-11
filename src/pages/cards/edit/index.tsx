import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Spinner } from "@stellar-ui-kit/web";
import { useCardById } from "@/hooks";
import { CardForm } from "@/components";

type EditCardPageProps = {
  cardId: string;
};

export const EditCardPage = ({ cardId }: EditCardPageProps) => {
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
};
