import type { Metadata } from "next";
import { Navbar } from "@/components/travel/Navbar";
import { Footer } from "@/components/travel/Footer";
import { Hero } from "@/components/travel/Hero";
import { InterestGrid } from "@/components/travel/InterestGrid";
import { DestinationShowcase } from "@/components/destinations/DestinationShowcase";
import { ExperienceSection } from "@/components/experiences/ExperienceSection";
import { MapSection } from "@/components/travel/MapSection";
import { PlanSection } from "@/components/travel/PlanSection";
import { GettingThereSection } from "@/components/flights/GettingThereSection";
import { StaySection } from "@/components/accommodation/StaySection";
import { CultureSection } from "@/components/travel/CultureSection";

/**
 * The homepage.
 *
 * This file is a server component and stays one. It composes sections and reads
 * nothing dynamic — the entire page renders statically at build time, which is
 * why the initial payload is small despite the visual weight of the page. The
 * only client code is three small islands: the map (lazy, WebGL), the trip
 * builder (deterministic, pure React) and the scroll-reveal observer.
 *
 * Section order is the mobile story order from the brief:
 *   Hero → interests → destinations → experiences → map → build → getting there
 *   → accommodation → culture
 *
 * Reading this file top to bottom is reading the site's argument: Malawi is not
 * a place, it is a thousand experiences.
 */

export const metadata: Metadata = {
  title: "Discover Malawi — Travel Lab",
  description:
    "The digital gateway for discovering, planning and experiencing Malawi. Destinations, experiences, an interactive 3D map, and a trip builder that plans a route you can actually drive.",
  keywords: [
    "Malawi travel",
    "visit Malawi",
    "things to do in Malawi",
    "Lake Malawi",
    "Cape Maclear",
    "Mount Mulanje",
    "Liwonde National Park",
    "Nyika National Park",
    "Malawi safari",
    "Malawi travel itinerary",
    "hotels in Malawi",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "Travel Lab",
    title: "Discover Malawi — Travel Lab",
    description:
      "One country. A thousand ways to experience it. Destinations, experiences, a 3D map, and a trip builder that plans a route you can actually drive.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Discover Malawi — Travel Lab",
    description:
      "One country. A thousand ways to experience it. Destinations, experiences, a 3D map, and a real trip planner.",
  },
};

/**
 * The site as a vertical travel story. Rendered top to bottom; the order IS the
 * narrative — see the file comment.
 */
export default function Home() {
  return (
    <>
      <Navbar />
      <main id="main">
        <Hero />
        <InterestGrid />
        <DestinationShowcase />
        <ExperienceSection />
        <MapSection />
        <PlanSection />
        <GettingThereSection />
        <StaySection />
        <CultureSection />
      </main>
      <Footer />
    </>
  );
}