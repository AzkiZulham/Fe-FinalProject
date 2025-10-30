"use client";

import { useState, useEffect, Suspense } from "react";
import Hero from "@/components/hero";
import PropertyList from "@/components/propertyList";
import Footer from "@/components/footer";
import BookingFilter from "@/components/bokingFilters";
import LocationModal from "@/components/locationModal";

type LocationData = {
  lat: number;
  lng: number;
  city: string;
};

export default function HomePage() {
  const [location, setLocation] = useState<LocationData | null>(null);

  useEffect(() => {
    if (location) {
    }
  }, [location]);

  const handleLocationDetected = (detectedLocation: LocationData) => {
    setLocation(detectedLocation);
    localStorage.setItem("userLocation", JSON.stringify(detectedLocation));
  };

  useEffect(() => {
    const storedLocation = localStorage.getItem("userLocation");
    if (storedLocation) {
      try {
        const parsedLocation = JSON.parse(storedLocation);
        setLocation(parsedLocation);
      } catch (error) {
        console.error("Error parsing stored location:", error);
      }
    }
  }, []);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <main className="pt-0.5 relative">
        <LocationModal onLocationDetected={handleLocationDetected} />
        <Hero />
        <div className="relative -mt-32 md:-mt-40 lg:-mt-48 z-[9999]">
          <BookingFilter noHeroMargin={true} location={location} />
        </div>
        <PropertyList limit={6} />
        <Footer />
      </main>
    </Suspense>
  );
}
