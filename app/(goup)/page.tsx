"use client";

import { LandingHero } from "./_components/landing-hero";
import { LandingFeatures } from "./_components/landing-features";
import { GoupFooter } from "./_components/goup-footer";

export default function LandingPage() {
  return (
    <div className="goup-page">
      {/* Fixed cosmos layer — painted once, never repaints on scroll */}
      <div className="goup-cosmos" aria-hidden="true" />
      <LandingHero />
      <LandingFeatures />
      <GoupFooter />
    </div>
  );
}
