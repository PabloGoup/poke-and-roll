"use client";

import { LandingHero } from "./_components_goup/landing-hero";
import { LandingFeatures } from "./_components_goup/landing-features";
import { SuccessCases } from "./_components_goup/success-cases";
// import { LandingPricing } from "./_components_goup/landing-pricing";
import { GoupFooter } from "./_components_goup/goup-footer";

export default function LandingPage() {
  return (
    <div className="goup-page">
      {/* Fixed cosmos layer — painted once, never repaints on scroll */}
      <div className="goup-cosmos" aria-hidden="true" />
      <LandingHero />
      <SuccessCases />
      <LandingFeatures />
      {/* <LandingPricing /> */}
      <GoupFooter />
    </div>
  );
}
