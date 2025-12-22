import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Macro BIM Adoption Dashboard",
  description: "Vercel-ready dashboard for Macro BIM Adoption survey exports"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
