"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { axios } from "@/lib/axios";
import UploadPaymentProofFormik from "@/components/orders/uploadPayment/uploadPayment";

type OrderDetail = {
  id: number;
  status: string;
  qty: number;
  totalPrice: number;
  checkInDate: string;
  checkOutDate: string;
  roomType?: {
    roomName?: string | null;
    property?: {
      name: string;
      city: string;
      address: string;
      destinationBank?: string | null;
      noRekening?: string | null;
    } | null;
  } | null;
};

export default function TransferCheckoutPage() {
  const sp = useSearchParams();
  const router = useRouter();
  const transactionId = Number(sp.get("transactionId") || 0);

  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const fetchDetail = async () => {
    if (!transactionId) return;
    setLoading(true);
    setErr(null);
    try {
      const res = await axios.get<{ message: string; data: OrderDetail }>(
        `/api/transaction/user/orders/${transactionId}`
      );
      setOrder(res.data.data);
    } catch (e: any) {
      setErr(e?.response?.data?.error || e.message || "Gagal memuat order");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [transactionId]);

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert("Disalin ke clipboard");
    } catch {
      alert("Gagal menyalin");
    }
  };

  return (
    <div className="mx-auto w-full max-w-screen-md px-3 sm:px-4 lg:px-6 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Pembayaran Transfer</h1>
        <button
          onClick={() =>
            router.push(`/checkout?transactionId=${transactionId}`)
          }
          className="text-sm underline"
        >
          Kembali ke Checkout
        </button>
      </div>

      {loading && <p>Loading...</p>}
      {err && <p className="text-rose-600">{err}</p>}

      {order && (
        <>
          <div className="rounded-xl border p-4 bg-white space-y-2">
            <div className="text-sm text-gray-700">
              <div className="font-medium">
                {order.roomType?.property?.name ?? "-"}
              </div>
              <div className="text-gray-500">
                {order.roomType?.roomName ?? "-"} •{" "}
                {order.roomType?.property?.city ?? "-"}
              </div>
              <div className="text-gray-500">
                {order.roomType?.property?.address ?? "-"}
              </div>
            </div>
            <div className="text-sm">
              <div>
                Tanggal: {new Date(order.checkInDate).toLocaleDateString()} —{" "}
                {new Date(order.checkOutDate).toLocaleDateString()}
              </div>
              <div>Jumlah kamar: {order.qty}</div>
            </div>
            <div className="flex items-center justify-between pt-2 border-t">
              <span className="font-medium">Total</span>
              <span className="text-lg font-bold text-blue-600">
                Rp {order.totalPrice.toLocaleString("id-ID")}
              </span>
            </div>
          </div>

          <div className="rounded-xl border p-4 bg-white space-y-3">
            <h2 className="font-semibold">Informasi Transfer</h2>

            <div className="rounded-md border p-3 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <div className="text-gray-500">Bank Tujuan</div>
                  <div className="font-medium">
                    {order.roomType?.property?.destinationBank ?? "—"}
                  </div>
                </div>
                {order.roomType?.property?.destinationBank && (
                  <button
                    onClick={() =>
                      copy(order.roomType!.property!.destinationBank!)
                    }
                    className="rounded-md border px-2 py-1 text-xs hover:bg-white"
                  >
                    Salin
                  </button>
                )}
              </div>

              <div className="flex items-center justify-between mt-2">
                <div className="text-sm">
                  <div className="text-gray-500">No. Rekening</div>
                  <div className="font-medium">
                    {order.roomType?.property?.noRekening ?? "—"}
                  </div>
                </div>
                {order.roomType?.property?.noRekening && (
                  <button
                    onClick={() => copy(order.roomType!.property!.noRekening!)}
                    className="rounded-md border px-2 py-1 text-xs hover:bg-white"
                  >
                    Salin
                  </button>
                )}
              </div>
            </div>

            <UploadPaymentProofFormik orderId={order.id} onDone={fetchDetail} />
          </div>
        </>
      )}
    </div>
  );
}
