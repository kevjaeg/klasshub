import { ForceLightMode } from "@/components/force-light-mode";
import { StickyCTABar } from "@/components/sticky-cta-bar";
import { LandingHeader } from "@/components/landing/landing-header";
import { HeroSection } from "@/components/landing/hero-section";
import { ProblemSection } from "@/components/landing/problem-section";
import { PlatformsSection } from "@/components/landing/platforms-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { PricingSection } from "@/components/landing/pricing-section";
import { CTASection } from "@/components/landing/cta-section";
import { LandingFooter } from "@/components/landing/landing-footer";

export default function LandingPage() {
  return (
    <div className="flex min-h-dvh flex-col overflow-x-hidden">
      <ForceLightMode />
      <LandingHeader />
      <main className="flex-1">
        <HeroSection />
        <ProblemSection />
        <PlatformsSection />
        <FeaturesSection />
        <PricingSection />
        <CTASection />
      </main>
      <StickyCTABar />
      <LandingFooter />
    </div>
  );
}
