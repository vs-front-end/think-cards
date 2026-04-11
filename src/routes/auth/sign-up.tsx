import { createFileRoute } from "@tanstack/react-router";
import { SignUpPage } from "@/pages";

export const Route = createFileRoute("/auth/sign-up")({
  component: SignUpPage,
});
