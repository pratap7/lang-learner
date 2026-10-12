import type { Metadata, Viewport } from "next";
import { Inter, Fraunces } from "next/font/google";
import { ToastProvider } from "@/components/ui/Toast";
import { KeyboardShortcutsModal } from "@/components/ui/KeyboardShortcutsModal";
import { PwaRegister } from "@/components/pwa/PwaRegister";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  axes: ["SOFT", "WONK"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "DeutschPfad — Learn German from A1 to C2",
  description:
    "Structured CEFR courses, spaced-repetition flashcards, timed mock tests, and daily streaks — your complete path to German fluency.",
  keywords: ["learn German", "German courses", "CEFR", "A1 to C2", "DeutschPfad", "German app"],
  openGraph: {
    title: "DeutschPfad — Learn German from A1 to C2",
    description:
      "Your structured, science-backed path to German fluency. Start free today.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "DeutschPfad — Learn German from A1 to C2",
    description: "Your structured, science-backed path to German fluency.",
  },
  robots: { index: true, follow: true },
  manifest: "/manifest.json",
  icons: {
    icon: "/icon-192.svg",
    apple: "/icon-192.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#6366f1",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${fraunces.variable} dark`}
      data-theme="dark"
      suppressHydrationWarning
    >
      <body className="font-[var(--font-inter)] antialiased">
        <ToastProvider>
          {children}
          <KeyboardShortcutsModal />
          <PwaRegister />
        </ToastProvider>
      </body>
    </html>
  );
}

