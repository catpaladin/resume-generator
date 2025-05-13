import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/ui/theme/theme-provider";
import { ThemeToggle } from "@/components/ui/theme/theme-toggle";
import { HeaderActions } from "@/components/layout/HeaderActions";
import { cn } from "@/lib/utils";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  authors: [{ name: "Your Name" }],
  keywords: ["resume", "cv", "builder", "job application", "career"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(geistSans.variable, geistMono.variable)}
    >
      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="relative flex min-h-screen flex-col">
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="container flex h-14 items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl font-bold tracking-tight whitespace-nowrap">Resume Builder</h1>
                </div>
                <div className="flex flex-1 justify-end items-center gap-2">
                  <HeaderActions />
                  <ThemeToggle />
                </div>
              </div>
            </header>

            <main className="flex-1">{children}</main>

            <footer className="border-t py-6 md:py-0">
              <div className="container flex flex-col items-center justify-between gap-4 md:h-14 md:flex-row">
                <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
                  A modern, professional resume builder application. Built with{" "}
                  <a
                    href="https://nextjs.org"
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium underline underline-offset-4"
                  >
                    Next.js
                  </a>{" "}
                  and{" "}
                  <a
                    href="https://tailwindcss.com"
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium underline underline-offset-4"
                  >
                    Tailwind CSS
                  </a>
                </p>
              </div>
            </footer>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
