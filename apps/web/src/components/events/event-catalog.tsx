"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight, CalendarDays, ChevronDown, MapPin, Search, SlidersHorizontal,
  Ticket, ArrowUpRight, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { demoEvents, type EventCategory, type EventPreview } from "@/lib/demo-events";

const categories: Array<"All events" | EventCategory> = [
  "All events", "Music", "Technology", "Sports", "Arts",
];

const statusLabels: Record<EventPreview["status"], string> = {
  available: "Tickets available",
  "sales-soon": "Sales open soon",
  "sold-out": "Sold out",
};

const categoryAccents: Record<EventCategory, string> = {
  Music: "from-violet-200 via-violet-100 to-indigo-100",
  Technology: "from-indigo-200 via-blue-100 to-sky-100",
  Sports: "from-emerald-200 via-emerald-100 to-teal-100",
  Arts: "from-rose-200 via-pink-100 to-orange-100",
};

function EventCard({ event }: { event: EventPreview }) {
  return (
    <article className="group overflow-hidden rounded-xl border border-slate-200/90 bg-white transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-200/40">
      <div className={`relative flex h-40 items-center justify-center bg-gradient-to-br ${categoryAccents[event.category]}`}>
        <div className="text-center">
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-violet-700/65">TicketFlow event cover</span>
          <p className="mt-2 text-xl font-extrabold tracking-tight text-violet-800">{event.category === "Music" ? "LIVE / MUSIC" : event.category.toUpperCase()}</p>
        </div>
        <span className="absolute right-3 top-3 rounded-full bg-white/85 px-2 py-1 text-[10px] font-medium text-violet-800">Demo event</span>
      </div>
      <div className="p-4">
        <div className="flex flex-wrap items-center gap-2 text-[11px]">
          <span className="rounded bg-slate-100 px-2 py-1 text-slate-600">{event.category}</span>
          <span className={`rounded px-2 py-1 font-medium ${
            event.status === "available"
              ? "bg-emerald-50 text-emerald-700"
              : event.status === "sales-soon"
                ? "bg-blue-50 text-blue-700"
                : "bg-slate-100 text-slate-500"
          }`}>{statusLabels[event.status]}</span>
        </div>
        <h3 className="mt-3 text-[17px] font-bold tracking-tight text-slate-900">{event.title}</h3>
        <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500"><CalendarDays size={13} aria-hidden="true" />{event.dateLabel}</p>
        <p className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-500"><MapPin size={13} aria-hidden="true" />{event.location}</p>
        <div className="mt-5 flex items-center justify-between gap-2">
          <span className="text-sm font-semibold text-slate-900">{event.priceLabel}</span>
          <Button asChild size="sm">
            <Link href={`/events/${event.id}`}>View event <ArrowRight size={13} /></Link>
          </Button>
        </div>
      </div>
    </article>
  );
}

export function EventCatalog() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<(typeof categories)[number]>("All events");
  const [sort, setSort] = useState("featured");
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const events = useMemo(() => {
    const query = search.trim().toLowerCase();
    const result = demoEvents.filter((event) => {
      const matchesSearch = !query || [event.title, event.category, event.location]
        .some((value) => value.toLowerCase().includes(query));
      return matchesSearch
        && (category === "All events" || event.category === category)
        && (!onlyAvailable || event.status === "available");
    });
    return sort === "name" ? [...result].sort((a, b) => a.title.localeCompare(b.title)) : result;
  }, [search, category, sort, onlyAvailable]);

  function reset() {
    setSearch("");
    setCategory("All events");
    setSort("featured");
    setOnlyAvailable(false);
  }

  return (
    <main id="events" className="mx-auto max-w-6xl px-4 pb-20 pt-8 sm:px-6 lg:px-8">
      <section className="grid min-h-60 gap-8 rounded-2xl bg-gradient-to-r from-[#f3eef9] to-[#f8f5fc] px-6 py-8 md:grid-cols-2 md:px-9 md:py-10" aria-labelledby="hero-title">
        <div className="self-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-violet-700">Discover · Book · Experience</p>
          <h1 id="hero-title" className="mt-3 max-w-md text-4xl font-extrabold leading-tight tracking-tight text-slate-900 md:text-5xl">Find your next<br />live moment.</h1>
          <p className="mt-3 max-w-sm text-sm leading-6 text-slate-500">Discover concerts, festivals and experiences worth leaving home for.</p>
          <Button asChild className="mt-5"><a href="#featured">Explore events <ArrowRight size={15}/></a></Button>
        </div>
        <div className="flex flex-col justify-between rounded-xl bg-violet-700 p-6 text-white shadow-xl shadow-violet-500/10">
          <div className="flex items-center justify-between gap-2 text-[10px] font-semibold uppercase tracking-widest text-violet-100">
            <span>This week&apos;s spotlight</span><span>Live / Music</span>
          </div>
          <div className="my-8">
            <h2 className="text-2xl font-bold tracking-tight">Midnight Live Festival</h2>
            <p className="mt-2 text-xs font-medium text-violet-200">24 December · Dhaka Arena</p>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-xs">From <strong>$49.00</strong></span>
            <Link href="/events/midnight-live" className="inline-flex items-center gap-2 rounded-md px-2 py-1 text-sm font-semibold hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
              View event <ArrowRight size={16}/>
            </Link>
          </div>
        </div>
      </section>

      <section aria-label="Search and filter demo events" className="mt-7">
        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="relative flex-1">
            <span className="sr-only">Search events, artists or venues</span>
            <Search aria-hidden="true" size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search events, artists or venues" className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-9 text-sm outline-none placeholder:text-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-100"/>
            {search && <button type="button" onClick={() => setSearch("")} aria-label="Clear search" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"><X size={16}/></button>}
          </label>
          <Button variant="outline" onClick={() => setShowFilters((current) => !current)} aria-expanded={showFilters} aria-controls="advanced-filters">
            <SlidersHorizontal size={15}/> Filters
          </Button>
          <div className="relative">
            <label htmlFor="event-sort" className="sr-only">Sort events</label>
            <select id="event-sort" value={sort} onChange={(e) => setSort(e.target.value)} className="h-10 w-full min-w-36 appearance-none rounded-lg border border-slate-200 bg-white px-3 pr-9 text-sm text-slate-700 focus-visible:outline-2 focus-visible:outline-violet-500">
              <option value="featured">Featured first</option>
              <option value="name">Name A–Z</option>
            </select>
            <ChevronDown aria-hidden="true" size={14} className="pointer-events-none absolute right-3 top-3 text-slate-500"/>
          </div>
        </div>
        {showFilters && (
          <div id="advanced-filters" className="mt-3 rounded-lg border border-slate-200 bg-white p-4">
            <label className="flex cursor-pointer items-center gap-3 text-sm text-slate-700">
              <input type="checkbox" checked={onlyAvailable} onChange={(e) => setOnlyAvailable(e.target.checked)} className="size-4 accent-violet-700" />
              Only show events with demo tickets available
            </label>
          </div>
        )}
      </section>

      <section className="mt-7" aria-labelledby="category-heading">
        <h2 id="category-heading" className="text-sm font-bold text-slate-900">Browse by category</h2>
        <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Filter event categories">
          {categories.map((item) => (
            <button key={item} type="button" onClick={() => setCategory(item)} aria-pressed={category === item}
              className={`min-h-10 rounded-lg border px-5 py-2 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500 ${
                category === item ? "border-violet-700 bg-violet-700 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-violet-300 hover:text-violet-800"
              }`}>
              {item}
            </button>
          ))}
        </div>
      </section>

      <section id="featured" className="mt-9 scroll-mt-7" aria-labelledby="featured-heading">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 id="featured-heading" className="text-xl font-extrabold tracking-tight text-slate-900">Featured events</h2>
            <p className="mt-1 text-xs text-slate-500">A few experiences worth putting on your calendar.</p>
          </div>
          <span className="text-xs text-slate-500" aria-live="polite">{events.length} {events.length === 1 ? "event" : "events"}</span>
        </div>
        {events.length ? (
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => <EventCard key={event.id} event={event}/>)}
          </div>
        ) : (
          <div className="mt-5 flex flex-col items-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
            <Ticket aria-hidden="true" className="text-violet-600" size={30}/>
            <h3 className="mt-4 text-lg font-bold">No events found</h3>
            <p className="mt-2 max-w-sm text-sm text-slate-500">Try another search term or remove a filter to see more demo events.</p>
            <Button onClick={reset} className="mt-5">Clear filters</Button>
          </div>
        )}
      </section>
      <section className="mt-9 flex flex-col items-start justify-between gap-5 rounded-xl bg-[#f3eef9] px-7 py-6 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Have an event to host?</h2>
          <p className="mt-1 text-xs text-slate-600">Organizer applications will be available when account management is connected.</p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-lg border border-violet-200 bg-white px-3 py-2 text-xs font-medium text-violet-800">
          Organizer access coming soon <ArrowUpRight size={14}/>
        </span>
      </section>
      <p className="mt-5 text-center text-[11px] text-slate-500">
        This is an interactive UI preview using fictional sample events. Availability and prices are not live.
      </p>
    </main>
  );
}
