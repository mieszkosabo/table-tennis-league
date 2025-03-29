import type { Metadata } from "next";
import "@app/globals.css";

export const metadata: Metadata = {
  title: "Vercel + Neon",
  description: "Use Neon with Vercel",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
