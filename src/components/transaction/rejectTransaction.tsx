"use client";
import { useState } from "react";
import { axios } from "@/lib/axios";

export default function RejectPaymentBtnTenant({
  orderId,
  onDone,
}: {
  orderId: number;
  onDone?: () => void;
}) {
  const [loading, setLoading] = useState(false);

  const onClick = async () => {
    if (!confirm("Tolak pembayaran ini? Bukti akan dihapus.")) return;
    setLoading(true);
    try {
      await axios.patch(`/api/transaction/tenant/orders/${orderId}/reject`);
      onDone?.();
    } catch (e: any) {
      alert(
        e?.response?.data?.error || e.message || "Gagal menolak pembayaran"
      );
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
      {loading ? "Memproses..." : "Tolak (Reset)"}
    </button>
  );
}
