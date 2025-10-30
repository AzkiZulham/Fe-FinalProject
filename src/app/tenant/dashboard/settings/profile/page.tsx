"use client";

import { Suspense } from "react";
import TenantUpdateProfilePage from "./TenantUpdateProfilePage";

export default function TenantProfilePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TenantUpdateProfilePage />
    </Suspense>
  );
}

export const dynamic = 'force-dynamic';
