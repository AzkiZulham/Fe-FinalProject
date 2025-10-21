"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { axios } from "@/lib/axios";
import { useAuth } from "@/context/authContext";
import StatusBadge from "@/components/statusBadge";
import ProtectedPage from "@/components/protectedPage";

type OrderDetail = {
  id: number;
  status:
    | "WAITING_FOR_PAYMENT"
    | "WAITING_FOR_CONFIRMATION"
    | "ACCEPTED"
    | "CANCELLED";
  qty: number;
  totalPrice: number;
  checkInDate: string;
  checkOutDate: string;
  createdAt: string;
  roomType?: {
    roomName?: string | null;
    property?: {
      id: number;
      name: string;
      city: string;
      address: string;
      noRekening?: string | null;
      destinationBank?: string | null;
    } | null;
  } | null;
  payment?: {
    paymentStatus?: string | null;
    method?: string | null;
    paymentUrl?: string | null;
  } | null;
};

export default function CheckoutPage() {
  const sp = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();

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
    console.log("auth user =>", user);
  }, [user]);

  useEffect(() => {
    if (!user) {
      router.replace("/login");
      return;
    }
    fetchDetail();
  }, [user, transactionId]);

  const payWithMidtrans = async () => {
    try {
      const resp = await axios.post<{
        token: string;
        redirect_url: string;
        orderId: string;
      }>("/api/payment/midtrans/create", { transactionId });
      if (resp.data?.redirect_url) {
        window.location.href = resp.data.redirect_url;
      } else {
        alert("Gagal membuka halaman pembayaran Midtrans.");
      }
    } catch (e: any) {
      alert(
        e?.response?.data?.error ||
          e.message ||
          "Gagal membuat pembayaran Midtrans"
      );
    }
  };

  if (!transactionId) {
    return (
      <div className="mx-auto max-w-screen-md p-6">
        <h1 className="text-xl font-semibold mb-2">Checkout</h1>
        <p className="text-gray-600">transactionId tidak ditemukan.</p>
      </div>
    );
  }

  return (
    <ProtectedPage role="USER">
      <div className="mx-auto w-full max-w-screen-lg px-3 sm:px-4 lg:px-6 py-6 space-y-6">
        <h1 className="text-2xl font-semibold">Checkout</h1>

        {loading && <p>Loading...</p>}
        {err && <p className="text-rose-600">{err}</p>}

        {order && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 space-y-4">
              <div className="rounded-xl border p-4 bg-white">
                <h2 className="font-semibold mb-3">Data Pengguna</h2>
                <div className="text-sm text-gray-700 space-y-1">
                  <div>
                    Nama:{" "}
                    <span className="font-medium">{user?.username ?? "-"}</span>
                  </div>
                  <div>
                    Email:{" "}
                    <span className="font-medium">{user?.email ?? "-"}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border p-4 bg-white space-y-3">
                <h2 className="font-semibold">Ringkasan Pesanan</h2>
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
                    Tanggal: {new Date(order.checkInDate).toLocaleDateString()}{" "}
                    — {new Date(order.checkOutDate).toLocaleDateString()}
                  </div>
                  <div>Jumlah kamar: {order.qty}</div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="font-medium">Total</span>
                  <span className="text-lg font-bold text-blue-600">
                    Rp {order.totalPrice.toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="pt-2">
                  <StatusBadge status={order.status} />
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="rounded-xl border p-4 bg-white space-y-3">
                <h2 className="font-semibold">Pilih Metode Pembayaran</h2>
                {order.status !== "WAITING_FOR_PAYMENT" && (
                  <p className="text-sm text-amber-600">
                    Metode pembayaran hanya tersedia saat status{" "}
                    <b>WAITING_FOR_PAYMENT</b>.
                  </p>
                )}

                <button
                  onClick={() =>
                    router.push(`/checkout/transfer?transactionId=${order.id}`)
                  }
                  disabled={order.status !== "WAITING_FOR_PAYMENT"}
                  className="w-full rounded-md border px-4 py-2 text-left hover:bg-gray-50 disabled:opacity-50"
                >
                  TRANSFER Bank (Upload Bukti)
                </button>

                <button
                  onClick={payWithMidtrans}
                  disabled={order.status !== "WAITING_FOR_PAYMENT"}
                  className="w-full rounded-md bg-black text-white px-4 py-2 hover:opacity-90 disabled:opacity-50"
                >
                  Bayar via MIDTRANS
                </button>

                {order.roomType?.property?.destinationBank &&
                  order.roomType?.property?.noRekening && (
                    <div className="mt-2 rounded-md border p-3 bg-gray-50">
                      <div className="text-xs text-gray-500 mb-1">
                        Info Transfer
                      </div>
                      <div className="text-sm">
                        Bank: <b>{order.roomType.property.destinationBank}</b>
                      </div>
                      <div className="text-sm">
                        No. Rek: <b>{order.roomType.property.noRekening}</b>
                      </div>
                    </div>
                  )}

                <p className="text-xs text-gray-500">
                  * Pembayaran manual (TRANSFER) wajib upload bukti dalam 1 jam
                  sejak pemesanan.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedPage>
  );
}
