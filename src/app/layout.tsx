import "./globals.css";
import Link from "next/link";
import type { ReactNode } from "react";

export const metadata = {
  title: "Social Media Dashboard",
  description: "Track campaign performance across Facebook, Instagram, TikTok, YouTube",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="border-b bg-white">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <Link href="/" className="text-lg font-semibold">Social Media Dashboard</Link>
            <nav className="flex gap-4 text-sm">
              <Link href="/" className="hover:underline">Overview</Link>
              <Link href="/live" className="hover:underline">Live</Link>
              <Link href="/campaigns" className="hover:underline">Campaigns</Link>
              <Link href="/reports" className="hover:underline">Reports</Link>
              <Link href="/alerts" className="hover:underline">Alerts</Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
