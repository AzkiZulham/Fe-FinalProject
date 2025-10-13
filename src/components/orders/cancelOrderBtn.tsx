"use client";
import { useState } from "react";
import { axios } from "@/lib/axios";

export default function CancelOrderBtn({
  orderId,
  onDone,
}: {
  orderId: number;
  onDone?: () => void;
}) {
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    if (!confirm("Apakah kamu yakin ingin membatalkan pesanan ini?")) return;

    try {
      setLoading(true);
      const res = await axios.patch(
        `/api/transaction/user/orders/${orderId}/cancel`
      );
      alert(res.data?.message || "Pesanan dibatalkan");
      onDone?.();
    } catch (err: any) {
      const msg =
        err?.response?.data?.error ||
        err?.message ||
        "Gagal membatalkan pesanan";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handle}
      disabled={loading}
      className="px-3 py-2 rounded-md border border-rose-300 text-rose-700 hover:bg-rose-50 disabled:opacity-50"
    >
      {loading ? "Membatalkan..." : "Batalkan Pesanan"}
    </button>
  );
}
