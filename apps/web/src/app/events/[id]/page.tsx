import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, MapPin, Ticket } from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";
import { demoEvents } from "@/lib/demo-events";

export function generateStaticParams() {
  return demoEvents.map(({ id }) => ({ id }));
}

export default async function EventDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = demoEvents.find((entry) => entry.id === id);
  if (!event) notFound();

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-violet-700 hover:underline">
          <ArrowLeft size={16} aria-hidden="true"/> Back to discover
        </Link>
        <div className="mt-7 grid gap-7 md:grid-cols-[minmax(0,1fr)_300px]">
          <div className="space-y-6">
            <div className="flex h-60 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-200 to-indigo-100">
              <div className="text-center">
                <Ticket size={36} className="mx-auto text-violet-700" aria-hidden="true" />
                <p className="mt-3 text-sm font-bold uppercase tracking-widest text-violet-700">Demo event cover</p>
              </div>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-violet-700">{event.category}</p>
              <h1 className="mt-2 text-3xl font-extrabold tracking-tight">{event.title}</h1>
              <p className="mt-4 flex items-center gap-2 text-sm text-slate-600"><CalendarDays size={17}/>{event.dateLabel}</p>
              <p className="mt-2 flex items-center gap-2 text-sm text-slate-600"><MapPin size={17}/>{event.location}</p>
            </div>
            <section className="rounded-xl border border-slate-200 bg-white p-6">
              <h2 className="font-bold">About this event</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                This is a fictional event in the TicketFlow frontend preview. Real event descriptions,
                schedules and ticket inventory will be loaded from the Express API.
              </p>
            </section>
          </div>
          <aside className="self-start rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="font-bold">Choose your tickets</h2>
            <div className="mt-5 flex items-center justify-between border-b border-slate-100 pb-4 text-sm">
              <span className="text-slate-600">Starting price</span><strong>{event.priceLabel.replace("From ", "")}</strong>
            </div>
            <p className="mt-4 text-sm font-semibold text-violet-700">
              {event.status === "sold-out" ? "Demo event marked sold out" : event.status === "sales-soon" ? "Demo ticket sales not started" : "Demo event — no reservations yet"}
            </p>
            <button type="button" disabled className="mt-5 h-11 w-full rounded-lg bg-violet-700 font-semibold text-white opacity-50">
              Booking integration pending
            </button>
            <p className="mt-3 text-xs leading-5 text-slate-500">The reservation API, verified email gate and inventory checks are not connected yet.</p>
          </aside>
        </div>
      </main>
    </>
  );
}
