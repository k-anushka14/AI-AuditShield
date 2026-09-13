import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI AuditShield — Cryptographic Evidence & Tamper Detection",
  description: "Investigate AI decisions. Verify the evidence. Detect tampering.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
