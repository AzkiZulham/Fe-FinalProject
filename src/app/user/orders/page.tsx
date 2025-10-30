import { Suspense } from "react";
import OrdersClient from "./ordersClient";

export const dynamic = 'force-dynamic';

export default function OrdersPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OrdersClient />
    </Suspense>
  );
}
