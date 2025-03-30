import type { Metadata } from "next";
import "@/app/globals.css";
import { TopBar } from "@/components/top-bar";
import { Toaster } from "@/components/ui/sonner";

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
      <body>
        <div className="min-h-screen flex flex-col">
          <TopBar />
          {children}
        </div>
        <Toaster />
      </body>
    </html>
  );
}
