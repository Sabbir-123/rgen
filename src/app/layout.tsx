import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { ThemeAndLanguageProvider } from "@/components/ThemeAndLanguageProvider";
import AppShell from "@/components/AppShell";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "Smart Invoice - Receipt Generator for Printing Shops",
  description: "Create, manage, and print professional invoices for BD Printing, Ullas Advertising, and printing presses in Bangladesh.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col font-sans" suppressHydrationWarning>
        <ThemeAndLanguageProvider>
          <AppShell>{children}</AppShell>
        </ThemeAndLanguageProvider>
      </body>
    </html>
  );
}
