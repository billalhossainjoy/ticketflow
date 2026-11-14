"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { DemoNotice } from "./demo-notice";
import { FormField } from "./form-field";

const schema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(1, "Enter your password"),
});

type SignInValues = z.infer<typeof schema>;

export function SignInForm() {
  const [previewMessage, setPreviewMessage] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<SignInValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  function onSubmit(_values: SignInValues) {
    // UI milestone only. Do not persist credentials or imply a real session.
    setPreviewMessage(true);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <FormField
        id="email"
        type="email"
        label="Email address"
        placeholder="you@example.com"
        autoComplete="email"
        error={errors.email?.message}
        {...register("email", { onChange: () => setPreviewMessage(false) })}
      />
      <FormField
        id="password"
        type="password"
        label="Password"
        placeholder="Enter your password"
        autoComplete="current-password"
        error={errors.password?.message}
        {...register("password", { onChange: () => setPreviewMessage(false) })}
      />
      {previewMessage && <DemoNotice action="Signing in" />}
      <Button type="submit" className="h-11 w-full">Sign in</Button>
      <p className="text-center text-sm text-slate-600">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-semibold text-violet-700 underline-offset-4 hover:underline">Create account</Link>
      </p>
      <p className="text-center text-xs text-slate-500">
        Need to verify your email?{" "}
        <Link href="/verify-email" className="font-semibold text-violet-700 underline-offset-4 hover:underline">Verification help</Link>
      </p>
    </form>
  );
}
