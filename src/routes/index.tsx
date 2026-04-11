import { createFileRoute } from "@tanstack/react-router";
import { WelcomePage } from "@/pages/welcome";

export const Route = createFileRoute("/")({
  component: WelcomePage,
});
