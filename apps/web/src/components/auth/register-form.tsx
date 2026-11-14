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
  name: z.string().trim().min(2, "Enter at least 2 characters"),
  email: z.email("Enter a valid email address"),
  password: z.string().min(8, "Use at least 8 characters"),
  confirmPassword: z.string().min(1, "Confirm your password"),
  agree: z.boolean().refine((agreed) => agreed, "You must confirm before continuing"),
}).refine((values) => values.password === values.confirmPassword, {
  path: ["confirmPassword"],
  message: "Passwords do not match",
});

type RegisterValues = z.infer<typeof schema>;

export function RegisterForm() {
  const [previewMessage, setPreviewMessage] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "", agree: false },
  });

  function onSubmit(_values: RegisterValues) {
    // Form validation only; real account creation will use the server-side identity module.
    setPreviewMessage(true);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <FormField
        id="name"
        label="Full name"
        placeholder="Your full name"
        autoComplete="name"
        error={errors.name?.message}
        {...register("name", { onChange: () => setPreviewMessage(false) })}
      />
      <FormField
        id="email"
        label="Email address"
        type="email"
        placeholder="you@example.com"
        autoComplete="email"
        error={errors.email?.message}
        {...register("email", { onChange: () => setPreviewMessage(false) })}
      />
      <FormField
        id="password"
        label="Password"
        type="password"
        placeholder="Create a password"
        autoComplete="new-password"
        hint="Use at least 8 characters."
        error={errors.password?.message}
        {...register("password", { onChange: () => setPreviewMessage(false) })}
      />
      <FormField
        id="confirmPassword"
        label="Confirm password"
        type="password"
        placeholder="Enter your password again"
        autoComplete="new-password"
        error={errors.confirmPassword?.message}
        {...register("confirmPassword", { onChange: () => setPreviewMessage(false) })}
      />
      <div>
        <label className="flex items-start gap-2.5 text-xs leading-5 text-slate-600">
          <input type="checkbox" {...register("agree", { onChange: () => setPreviewMessage(false) })} aria-invalid={Boolean(errors.agree)} aria-describedby={errors.agree ? "agree-error" : undefined} className="mt-1 size-4 shrink-0 accent-violet-700" />
          <span>I understand that this is a UI preview and does not create an account.</span>
        </label>
        {errors.agree && <p id="agree-error" role="alert" className="mt-1.5 text-xs text-red-600">{errors.agree.message}</p>}
      </div>
      {previewMessage && <DemoNotice action="Creating an account" />}
      <Button type="submit" className="h-11 w-full">Create account</Button>
      <p className="text-center text-sm text-slate-600">
        Already have an account?{" "}
        <Link href="/sign-in" className="font-semibold text-violet-700 underline-offset-4 hover:underline">Sign in</Link>
      </p>
    </form>
  );
}
