import Link from "next/link";
import { ArrowLeft, CalendarDays, CheckCircle2, ShieldCheck, Ticket } from "lucide-react";
import type { ReactNode } from "react";

type AuthShellProps = {
  children: ReactNode;
  title: string;
  description: string;
};

export function AuthShell({ children, title, description }: AuthShellProps) {
  return (
    <main className="grid min-h-screen bg-white lg:grid-cols-2">
      <section className="flex min-h-screen flex-col px-5 py-6 sm:px-10 lg:px-14 xl:px-20">
        <header className="flex items-center justify-between gap-3">
          <Link href="/" className="inline-flex items-center gap-2 text-base font-extrabold tracking-tight text-slate-900 focus-visible:rounded focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-600">
            <span className="flex size-9 items-center justify-center rounded-lg bg-violet-700 text-white"><Ticket size={19} aria-hidden="true" /></span>
            TicketFlow
          </Link>
          <Link href="/" className="inline-flex items-center gap-1.5 rounded-md text-xs font-semibold text-slate-500 hover:text-violet-700 focus-visible:outline-2 focus-visible:outline-violet-600">
            <ArrowLeft size={14} aria-hidden="true" /> Discover events
          </Link>
        </header>
        <div className="mx-auto flex w-full max-w-[420px] flex-1 flex-col justify-center py-12">
          <div className="mb-7">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700">
              <ShieldCheck size={14} aria-hidden="true" /> Your TicketFlow account
            </span>
            <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">{title}</h1>
            <p className="mt-3 text-sm leading-6 text-slate-500">{description}</p>
          </div>
          {children}
        </div>
        <footer className="text-center text-xs text-slate-400">
          TicketFlow UI preview · Authentication is not connected yet
        </footer>
      </section>
      <aside aria-label="TicketFlow benefits" className="relative hidden overflow-hidden bg-gradient-to-br from-[#482080] via-[#7139b8] to-[#8b51d0] px-14 py-16 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-20 top-10 size-72 rounded-full border border-white/20" aria-hidden="true" />
        <div className="absolute -bottom-28 -left-20 size-96 rounded-full border border-white/15" aria-hidden="true" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold">
            <CalendarDays size={15} aria-hidden="true" /> Experiences made simple
          </div>
          <h2 className="mt-12 max-w-lg text-4xl font-extrabold leading-tight tracking-tight xl:text-5xl">
            Every memorable moment starts here.
          </h2>
          <p className="mt-5 max-w-md text-sm leading-7 text-violet-100">
            Discover events, manage your reservations and keep all your tickets together.
          </p>
        </div>
        <div className="relative max-w-md rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-xl bg-white/15">
              <CheckCircle2 size={23} aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-bold">Less hassle. More experiences.</p>
              <p className="mt-1 text-xs text-violet-100">Simple event discovery and booking.</p>
            </div>
          </div>
          <div className="mt-5 flex gap-2">
            <span className="h-1.5 flex-1 rounded-full bg-white" />
            <span className="h-1.5 flex-1 rounded-full bg-white/30" />
            <span className="h-1.5 flex-1 rounded-full bg-white/30" />
          </div>
        </div>
      </aside>
    </main>
  );
}
