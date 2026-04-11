import { createFileRoute } from "@tanstack/react-router";
import { WelcomePage } from "@/pages";

export const Route = createFileRoute("/")({
  component: WelcomePage,
});
