import { Suspense } from "react";
import AddPropertyClient from "./addPropertyClient";

export const dynamic = 'force-dynamic';

export default function AddPropertyPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AddPropertyClient />
    </Suspense>
  );
}
