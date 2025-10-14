"use client";
import { useState } from "react";
import { axios } from "@/lib/axios";

export default function AcceptPaymentBtnTenant({
  orderId,
  onDone,
}: {
  orderId: number;
  onDone?: () => void;
}) {
  const [loading, setLoading] = useState(false);

  const onClick = async () => {
    if (!confirm("Terima pembayaran ini?")) return;
    setLoading(true);
    try {
      await axios.patch(`/api/transaction/tenant/orders/${orderId}/confirm`);
      onDone?.();
    } catch (e: any) {
      alert(e?.response?.data?.error || e.message || "Gagal mengonfirmasi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="w-full sm:w-auto rounded-md bg-black text-white px-4 py-2 hover:opacity-90 disabled:opacity-50"
    >
      {loading ? "Memproses..." : "Terima Pembayaran"}
    </button>
  );
}
