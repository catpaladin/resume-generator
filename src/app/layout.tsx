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
      <body className="bg-background min-h-screen font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex min-h-screen flex-col">
            <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
              <div className="container flex h-14 items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl font-bold tracking-tight whitespace-nowrap">
                    Resume Builder
                  </h1>
                </div>
                <div className="flex flex-1 items-center justify-end gap-2">
                  <HeaderActions />
                  <ThemeToggle />
                </div>
              </div>
            </header>

            <main className="flex-1">{children}</main>

            <footer className="bg-background/95 supports-[backdrop-filter]:bg-background/60 mt-auto border-t py-6 backdrop-blur md:py-0">
              <div className="container flex flex-col items-center justify-between gap-4 md:h-14 md:flex-row">
                <p className="text-muted-foreground text-center text-sm leading-loose md:text-left">
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
