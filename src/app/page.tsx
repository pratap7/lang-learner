import dynamic from "next/dynamic";
import type { Metadata } from "next";
import { Navbar } from "@/components/landing/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { ProductDemoArea } from "@/components/landing/ProductDemoArea";
import { SocialProofBar } from "@/components/landing/SocialProofBar";
import { Footer } from "@/components/landing/Footer";

// Dynamically code-split below-the-fold sections to minimize mobile initial bundle size
const ComparisonTable = dynamic(
  () => import("@/components/landing/ComparisonTable").then((mod) => mod.ComparisonTable),
  { ssr: true }
);
const FeatureShowcase = dynamic(
  () => import("@/components/landing/FeatureShowcase").then((mod) => mod.FeatureShowcase),
  { ssr: true }
);
const LearningJourney = dynamic(
  () => import("@/components/landing/LearningJourney").then((mod) => mod.LearningJourney),
  { ssr: true }
);
const LearnerPathways = dynamic(
  () => import("@/components/landing/LearnerPathways").then((mod) => mod.LearnerPathways),
  { ssr: true }
);
const HowAITutorWorks = dynamic(
  () => import("@/components/landing/HowAITutorWorks").then((mod) => mod.HowAITutorWorks),
  { ssr: true }
);
const PricingSection = dynamic(
  () => import("@/components/landing/PricingSection").then((mod) => mod.PricingSection),
  { ssr: true }
);
const FAQSection = dynamic(
  () => import("@/components/landing/FAQSection").then((mod) => mod.FAQSection),
  { ssr: true }
);
const CTABanner = dynamic(
  () => import("@/components/landing/CTABanner").then((mod) => mod.CTABanner),
  { ssr: true }
);
const StickyMobileCTA = dynamic(
  () => import("@/components/landing/StickyMobileCTA").then((mod) => mod.StickyMobileCTA)
);

export const metadata: Metadata = {
  metadataBase: new URL("https://deutschpfad.app"),
  title: "DeutschPfad — Master German from A1 to C1 with Clinical CEFR Rigor",
  description:
    "Science-backed German learning for English speakers. Color-coded grammar cases, SuperMemo-2 flashcards, Goethe & telc writing rubric feedback, and zero AI hallucinations.",
  keywords: [
    "learn German",
    "German courses",
    "CEFR German",
    "Goethe Zertifikat preparation",
    "telc Deutsch",
    "TestDaF",
    "German grammar cases",
    "SM-2 spaced repetition",
    "medical German FSP",
    "DTZ Einbürgerung",
  ],
  alternates: {
    canonical: "https://deutschpfad.app",
  },
  openGraph: {
    title: "DeutschPfad — Master German from A1 to C1 with Clinical CEFR Rigor",
    description:
      "Skip unstructured chatbots and cartoon games. Learn German with color-coded grammar logic, SuperMemo-2 spaced repetition, and Goethe-Institut rubric evaluation.",
    url: "https://deutschpfad.app",
    siteName: "DeutschPfad",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "DeutschPfad - German Learning Platform Aligned with CEFR Standards",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DeutschPfad — Master German from A1 to C1 with Clinical CEFR Rigor",
    description:
      "Skip unstructured chatbots and cartoon games. Learn German with color-coded grammar logic, SuperMemo-2 spaced repetition, and Goethe-Institut rubric evaluation.",
    images: ["/og-image.svg"],
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "name": "DeutschPfad",
      "applicationCategory": "EducationalApplication",
      "operatingSystem": "Web, iOS, Android",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "EUR",
        "description": "Free Starter Plan available with no credit card required.",
      },
      "description":
        "Clinical German language platform featuring CEFR curriculum, color-coded grammar cases, SuperMemo-2 flashcards, and Goethe & telc writing rubric evaluation.",
    },
    {
      "@type": "EducationalOrganization",
      "name": "DeutschPfad EdTech",
      "url": "https://deutschpfad.app",
      "logo": "https://deutschpfad.app/icon-512.svg",
      "sameAs": ["https://twitter.com/deutschpfad", "https://github.com/deutschpfad"],
    },
  ],
};

export default function LandingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)]">
        <Navbar />
        <HeroSection />
        <ProductDemoArea />
        <SocialProofBar />
        <ComparisonTable />
        <FeatureShowcase />
        <LearningJourney />
        <LearnerPathways />
        <HowAITutorWorks />
        <PricingSection />
        <FAQSection />
        <CTABanner />
        <Footer />
        <StickyMobileCTA />
      </main>
    </>
  );
}
