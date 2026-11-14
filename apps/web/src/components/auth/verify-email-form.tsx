"use client";

import Link from "next/link";
import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { DemoNotice } from "./demo-notice";
import { FormField } from "./form-field";

const emailSchema = z.email("Enter a valid email address");

export function VerifyEmailForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [requested, setRequested] = useState(false);

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = emailSchema.safeParse(email.trim());
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Enter a valid email");
      setRequested(false);
      return;
    }
    setError("");
    // UI-only: no email is sent and no verification is asserted.
    setRequested(true);
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-violet-100 bg-violet-50 p-4 text-sm leading-6 text-violet-900">
        A verification link will be sent after real authentication is connected. You must verify your email before booking.
      </div>
      <form onSubmit={submit} className="space-y-5" noValidate>
        <FormField
          id="verification-email"
          label="Email address"
          type="email"
          placeholder="you@example.com"
          value={email}
          autoComplete="email"
          onChange={(event) => { setEmail(event.target.value); setError(""); setRequested(false); }}
          error={error}
        />
        {requested && <DemoNotice action="Sending a verification link" />}
        <Button type="submit" className="h-11 w-full">Request verification link</Button>
      </form>
      <p className="text-center text-sm text-slate-600">
        Back to{" "}
        <Link href="/sign-in" className="font-semibold text-violet-700 underline-offset-4 hover:underline">sign in</Link>
      </p>
    </div>
  );
}
