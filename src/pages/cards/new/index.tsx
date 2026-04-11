import { CardForm } from "@/components";

type NewCardPageProps = {
  deckId?: string;
};

export const NewCardPage = ({ deckId }: NewCardPageProps) => (
  <CardForm defaultDeckId={deckId} />
);
