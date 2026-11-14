import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { VerifyEmailForm } from "@/components/auth/verify-email-form";

export const metadata: Metadata = { title: "Verify your email | TicketFlow" };

export default function VerifyEmailPage() {
  return (
    <AuthShell title="Verify your email" description="Email verification is required before you can reserve tickets.">
      <VerifyEmailForm />
    </AuthShell>
  );
}
