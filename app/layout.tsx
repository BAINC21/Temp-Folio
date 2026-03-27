import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Folio — Client Portal for Freelancers",
  description: "Branded portals, project tracking, file sharing, and invoicing.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-f-bg text-f-text antialiased">{children}</body>
    </html>
  );
}
