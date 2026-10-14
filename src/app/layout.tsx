import type { Metadata, Viewport } from "next";
import { Inter, Outfit, Fraunces } from "next/font/google";
import { ToastProvider } from "@/components/ui/Toast";
import { AccessibilityProvider } from "@/lib/accessibility/AccessibilityContext";
import { I18nProvider } from "@/lib/i18n/I18nContext";
import dynamic from "next/dynamic";
import { PwaRegister } from "@/components/pwa/PwaRegister";
import "./globals.css";

const KeyboardShortcutsModal = dynamic(
  () => import("@/components/ui/KeyboardShortcutsModal").then((m) => m.KeyboardShortcutsModal)
);

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
});

const outfit = Outfit({
  subsets: ["latin", "latin-ext"],
  variable: "--font-outfit",
  display: "swap",
  preload: true,
});

const fraunces = Fraunces({
  subsets: ["latin", "latin-ext"],
  variable: "--font-fraunces",
  axes: ["SOFT", "WONK"],
  display: "swap",
  preload: false,
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
    icon: [
      { url: "/icon-192.svg", sizes: "192x192", type: "image/svg+xml" },
      { url: "/icon-512.svg", sizes: "512x512", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/icon-192.svg", sizes: "192x192" },
      { url: "/icon-512.svg", sizes: "512x512" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "DeutschPfad",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0b0f19" },
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
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

