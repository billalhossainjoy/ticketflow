import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = { title: "Create an account | TicketFlow" };

export default function RegisterPage() {
  return (
    <AuthShell title="Create your account" description="Join TicketFlow to explore events and keep your bookings together.">
      <RegisterForm />
    </AuthShell>
  );
}
