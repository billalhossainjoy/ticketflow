import { EventCatalog } from "@/components/events/event-catalog";
import { SiteHeader } from "@/components/layout/site-header";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <EventCatalog />
    </>
  );
}
