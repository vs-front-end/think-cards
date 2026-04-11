import { createFileRoute } from "@tanstack/react-router";
import { NotFoundPage } from "@/pages";

export const Route = createFileRoute("/$")({
  component: NotFoundPage,
});
