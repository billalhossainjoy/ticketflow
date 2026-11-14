import Link from "next/link";
import { SiteHeader } from "@/components/layout/site-header";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-6 text-center">
        <h1 className="text-3xl font-extrabold">Event not found</h1>
        <p className="mt-3 text-sm text-slate-600">That event does not exist in this preview.</p>
        <Link href="/" className="mt-6 rounded-lg bg-violet-700 px-5 py-3 text-sm font-semibold text-white">Back to discover</Link>
      </main>
    </>
  );
}
