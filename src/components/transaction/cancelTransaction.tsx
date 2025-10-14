"use client";
import { axios } from "@/lib/axios";
import { useState } from "react";

export default function CancelOrderBtnTenant({
  orderId,
  onDone,
}: {
  orderId: number;
  onDone?: () => void;
}) {
  const [loading, setLoading] = useState(false);

  const onClick = async () => {
    if (!confirm("Batalkan transaksi ini?")) return;
    setLoading(true);
    try {
      await axios.patch(`/api/transaction/tenant/orders/${orderId}/cancel`);
      onDone?.();
    } catch (e: any) {
      alert(e?.response?.data?.error || e.message || "Gagal membatalkan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="w-full sm:w-auto rounded-md border px-4 py-2 hover:bg-gray-50 disabled:opacity-50"
    >
      {loading ? "Memproses..." : "Batalkan"}
    </button>
  );
}
