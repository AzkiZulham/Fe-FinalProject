"use client";
import { useState } from "react";
import { axios } from "@/lib/axios";
import toast from "react-hot-toast";

export default function RejectPaymentBtnTenant({
  orderId,
  onDone,
}: {
  orderId: number;
  onDone?: () => void;
}) {
  const [loading, setLoading] = useState(false);

  const onClick = async () => {
    toast(
      (t) => (
        <div className="space-y-2">
          <p className="text-sm font-medium">
            Yakin ingin membatalkan pembayaran ini?
          </p>
          <div className="flex gap-2 justify-end">
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                setLoading(true);
                try {
                  await toast.promise(
                    axios.patch(
                      `/api/transaction/tenant/orders/${orderId}/reject`
                    ),
                    {
                      loading: "Memproses...",
                      success: "Pembayaran berhasil dibatalkan",
                      error: "Gagal mengonfirmasi pembayaran",
                    }
                  );
                  onDone?.();
                } catch {
                } finally {
                  setLoading(false);
                }
              }}
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-md text-sm font-medium"
            >
              Ya
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="bg-red-500 border border-red-300 text-white-700 hover:bg-red-100 px-3 py-1.5 rounded-md text-sm font-medium"
            >
              Batal
            </button>
          </div>
        </div>
      ),
      {
        duration: 5000,
        position: "top-center",
      }
    );
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
