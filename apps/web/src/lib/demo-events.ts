// Temporary sample content only: no live API or ticket availability is implied.
export type EventCategory = "Music" | "Technology" | "Sports" | "Arts";
export type EventStatus = "available" | "sales-soon" | "sold-out";

export interface EventPreview {
  id: string;
  title: string;
  category: EventCategory;
  location: string;
  dateLabel: string;
  priceLabel: string;
  status: EventStatus;
}

export const demoEvents: EventPreview[] = [
  {
    id: "midnight-live",
    title: "Midnight Live Festival",
    category: "Music",
    dateLabel: "24 December 2026 · 7:00 PM",
    location: "Dhaka Arena · Dhaka",
    priceLabel: "From $49.00",
    status: "available",
  },
  {
    id: "tech-forward",
    title: "Tech Forward Summit",
    category: "Technology",
    dateLabel: "14 January 2027 · 10:00 AM",
    location: "BICC · Dhaka",
    priceLabel: "From $35.00",
    status: "sales-soon",
  },
  {
    id: "dhaka-indie-nights",
    title: "Dhaka Indie Nights",
    category: "Music",
    dateLabel: "20 January 2027 · 8:00 PM",
    location: "Theatre Hall · Dhaka",
    priceLabel: "From $25.00",
    status: "sold-out",
  },
  {
    id: "makers-fair",
    title: "Makers & Creators Fair",
    category: "Arts",
    dateLabel: "28 January 2027 · 11:00 AM",
    location: "Creative Hub · Dhaka",
    priceLabel: "From $18.00",
    status: "available",
  },
];
