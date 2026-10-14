import type { Metadata, Viewport } from "next";
import { Inter, Outfit, Fraunces } from "next/font/google";
import { ToastProvider } from "@/components/ui/Toast";
import { AccessibilityProvider } from "@/lib/accessibility/AccessibilityContext";
import { I18nProvider } from "@/lib/i18n/I18nContext";
import { KeyboardShortcutsModal } from "@/components/ui/KeyboardShortcutsModal";
import { PwaRegister } from "@/components/pwa/PwaRegister";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
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
      className={`${inter.variable} ${outfit.variable} ${fraunces.variable} dark`}
      data-theme="dark"
      suppressHydrationWarning
    >
      <body className="font-[var(--font-inter)] antialiased">
        <AccessibilityProvider>
          <I18nProvider>
            <ToastProvider>
              {children}
              <KeyboardShortcutsModal />
              <PwaRegister />
            </ToastProvider>
          </I18nProvider>
        </AccessibilityProvider>
      </body>
    </html>
  );
}

