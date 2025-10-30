"use client";

import { Suspense } from "react";
import AvailabilityContent from "./AvailabilityContent";

export default function AvailabilityPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AvailabilityContent />
    </Suspense>
  );
}

export const dynamic = 'force-dynamic';
