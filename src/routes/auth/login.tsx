import { createFileRoute } from "@tanstack/react-router";
import { LoginPage } from "@/pages";

export const Route = createFileRoute("/auth/login")({
  component: LoginPage,
});
