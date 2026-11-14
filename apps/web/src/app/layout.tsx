import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TicketFlow | Discover live events",
  description: "Discover concerts, festivals, and memorable experiences with TicketFlow.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[var(--page-bg)] font-sans text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
