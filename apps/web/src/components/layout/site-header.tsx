import Link from "next/link";
import { Ticket } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-extrabold tracking-tight text-slate-900" aria-label="TicketFlow home">
          <span className="flex size-8 items-center justify-center rounded-lg bg-violet-700 text-white"><Ticket size={17} aria-hidden="true"/></span>
          TicketFlow
        </Link>
        <nav aria-label="Main navigation" className="flex items-center gap-2 text-xs font-semibold sm:gap-4">
          <Link href="/#featured" className="rounded-lg bg-violet-100 px-3 py-2.5 text-violet-800 hover:bg-violet-200 focus-visible:outline-2 focus-visible:outline-violet-500">Discover</Link>
          <span className="cursor-not-allowed px-2 py-2.5 text-slate-400" title="Requires account integration">Bookings</span>
          <span className="hidden cursor-not-allowed px-2 py-2.5 text-slate-400 sm:inline" title="Requires organizer onboarding">For hosts</span>
        </nav>
      </div>
    </header>
  );
}
