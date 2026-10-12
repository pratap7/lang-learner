import { Navbar }         from "@/components/landing/Navbar";
import { HeroSection }    from "@/components/landing/HeroSection";
import { HowItWorks }     from "@/components/landing/HowItWorks";
import { RoadmapSection } from "@/components/landing/RoadmapSection";
import { FeaturesGrid }   from "@/components/landing/FeaturesGrid";
import { LessonPreview }  from "@/components/landing/LessonPreview";
import { Testimonials }   from "@/components/landing/Testimonials";
import { FAQSection }     from "@/components/landing/FAQSection";
import { CTABanner }      from "@/components/landing/CTABanner";
import { Footer }         from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <main>
      <Navbar />
      <HeroSection />
      <HowItWorks />
      <RoadmapSection />
      <FeaturesGrid />
      <LessonPreview />
      <Testimonials />
      <FAQSection />
      <CTABanner />
      <Footer />
    </main>
  );
}
