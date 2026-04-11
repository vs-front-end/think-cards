import { createFileRoute } from "@tanstack/react-router";
import { PrivacyPage } from "@/pages";

export const Route = createFileRoute("/legal/privacy")({
  component: PrivacyPage,
});
