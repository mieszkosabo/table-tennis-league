import type { Metadata } from "next";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Table Tennis League",
  description: "Table Tennis League",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
