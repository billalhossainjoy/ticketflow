import Link from "next/link";
import { Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-extrabold tracking-tight text-slate-900" aria-label="TicketFlow home">
          <span className="flex size-8 items-center justify-center rounded-lg bg-violet-700 text-white">
            <Ticket size={17} aria-hidden="true" />
          </span>
          TicketFlow
        </Link>
        <nav aria-label="Main navigation" className="flex items-center gap-2 text-xs font-semibold sm:gap-4">
          <Link href="/#featured" className="hidden rounded-lg px-3 py-2.5 text-slate-700 hover:bg-violet-50 hover:text-violet-800 focus-visible:outline-2 focus-visible:outline-violet-600 sm:inline-flex">
            Discover
          </Link>
          <span className="hidden cursor-not-allowed px-2 py-2.5 text-slate-400 md:inline" title="Available after authentication integration">
            Bookings
          </span>
          <Link href="/sign-in" className="rounded-lg px-3 py-2.5 text-slate-700 hover:bg-violet-50 hover:text-violet-800 focus-visible:outline-2 focus-visible:outline-violet-600">
            Sign in
          </Link>
          <Button asChild size="sm">
            <Link href="/register">Create account</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
