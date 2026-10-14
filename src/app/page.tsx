import type { Metadata } from "next";
import { Navbar } from "@/components/landing/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { ProductDemoArea } from "@/components/landing/ProductDemoArea";
import { SocialProofBar } from "@/components/landing/SocialProofBar";
import { ComparisonTable } from "@/components/landing/ComparisonTable";
import { FeatureShowcase } from "@/components/landing/FeatureShowcase";
import { LearningJourney } from "@/components/landing/LearningJourney";
import { LearnerPathways } from "@/components/landing/LearnerPathways";
import { HowAITutorWorks } from "@/components/landing/HowAITutorWorks";
import { PricingSection } from "@/components/landing/PricingSection";
import { FAQSection } from "@/components/landing/FAQSection";
import { CTABanner } from "@/components/landing/CTABanner";
import { Footer } from "@/components/landing/Footer";
import { StickyMobileCTA } from "@/components/landing/StickyMobileCTA";

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
