import type { Metadata } from "next";
import "@/app/globals.css";
import { ThemeProvider } from "@/components/providers";
import { TopBar } from "@/components/top-bar";
import { Toaster } from "@/components/ui/sonner";
import { VStack } from "@/components/ui/stack";

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
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TopBar />
          <div className="min-h-screen flex flex-col w-full items-center">
            <VStack className="w-full max-w-screen-lg py-16 px-4">
              {children}
            </VStack>
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
