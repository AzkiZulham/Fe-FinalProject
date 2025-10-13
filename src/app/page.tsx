"use client";

import Hero from "@/components/hero";
import PropertyList from "@/components/propertyList";
import Footer from "@/components/footer";
import BookingFilter from "@/components/bokingFilters";

export default function HomePage() {
  return (
    <main className="pt-0.5">
      <Hero />
      <div className="relative -mt-32 md:-mt-40 lg:-mt-48 z-[9999]">
        <BookingFilter noHeroMargin={true} />
      </div>
      <PropertyList limit={6} />
      <Footer />
    </main>
  );
}
