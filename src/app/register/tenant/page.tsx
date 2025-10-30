import { Suspense } from "react";
import RegisterTenant from "./registerTenantClient";

export const dynamic = 'force-dynamic';

export default function RegisterTenantPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RegisterTenant />
    </Suspense>
  );
}
