import { ForceLightMode } from "@/components/force-light-mode";
import { StickyCTABar } from "@/components/sticky-cta-bar";
import { StructuredData } from "@/components/landing/structured-data";
import { FAQStructuredData } from "@/components/landing/faq-structured-data";
import { FAQSection } from "@/components/landing/faq-section";
import { LandingHeader } from "@/components/landing/landing-header";
import { HeroSection } from "@/components/landing/hero-section";
import { ProblemSection } from "@/components/landing/problem-section";
import { PlatformsSection } from "@/components/landing/platforms-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { TestimonialsSection } from "@/components/landing/testimonials-section";
import { PricingSection } from "@/components/landing/pricing-section";
import { CTASection } from "@/components/landing/cta-section";
import { ShareSection } from "@/components/landing/share-section";
import { LandingFooter } from "@/components/landing/landing-footer";

export default function LandingPage() {
  return (
    <div className="flex min-h-dvh flex-col overflow-x-hidden">
      <StructuredData />
      <FAQStructuredData />
      <ForceLightMode />
      <LandingHeader />
      <main className="flex-1">
        <HeroSection />
        <ProblemSection />
        <PlatformsSection />
        <FeaturesSection />
        <TestimonialsSection />
        <PricingSection />
        <FAQSection />
        <CTASection />
        <ShareSection />
      </main>
      <StickyCTABar />
      <LandingFooter />
    </div>
  );
}
