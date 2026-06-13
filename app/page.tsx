"use client";

import dynamic from "next/dynamic";
import { LandingNav } from "./_components_goup/landing-nav";
import { LandingHero } from "./_components_goup/landing-hero";
import { GoupFooter } from "./_components_goup/goup-footer";
import { ScrollReveal } from "./_components_goup/scroll-reveal";

// Secciones bajo el fold: code-split, SSR activo para SEO
const PhoneDemo = dynamic(() => import("./_components_goup/phone-demo").then((m) => m.PhoneDemo));
const DigitalTwin = dynamic(() => import("./_components_goup/digital-twin").then((m) => m.DigitalTwin));
const BusinessSimulator = dynamic(() =>
  import("./_components_goup/business-simulator").then((m) => m.BusinessSimulator)
);
const LiveDashboard = dynamic(() =>
  import("./_components_goup/live-dashboard").then((m) => m.LiveDashboard)
);
const TechArchitecture = dynamic(() =>
  import("./_components_goup/tech-architecture").then((m) => m.TechArchitecture)
);
const FinalCta = dynamic(() => import("./_components_goup/final-cta").then((m) => m.FinalCta));

export default function LandingPage() {
  return (
    <div className="goup-page">
      <div className="goup-cosmos" aria-hidden="true" />
      <ScrollReveal />
      <LandingNav />
      <LandingHero />
      <PhoneDemo />
      <LiveDashboard />
      <DigitalTwin />
      <BusinessSimulator />
      <TechArchitecture />
      <FinalCta />
      <GoupFooter />
    </div>
  );
}
