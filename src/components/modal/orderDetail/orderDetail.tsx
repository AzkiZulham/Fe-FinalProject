"use client";
import { useEffect, useState } from "react";
import { axios } from "@/lib/axios";
import CancelOrderBtn from "@/components/orders/cancelOrderBtn";
import { UserOrderDetail, UserOrderDetailResponse } from "@/lib/orders/types";
import StatusBadge from "../../statusBadge";
import ReviewSection from "../../orders/review/reviewFormik";
import UploadPaymentProofFormik from "../../orders/uploadPayment/uploadPayment";
import { payWithMidtrans } from "@/components/orders/midtransPayment/payWithMidtrans";
import PaymentProofPreview from "@/components/transaction/previewPaymentProof";

export default function OrderDetailBody({ id }: { id: number }) {
  const [order, setOrder] = useState<UserOrderDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);

  const fetchOne = async () => {
    setLoading(true);
    setErr(null);
    try {
      const res = await axios.get<UserOrderDetailResponse>(
        `/api/transaction/user/orders/${id}`
      );
      setOrder(res.data.data);
    } catch (e: any) {
      setErr(e.message || "Gagal memuat detail order");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOne();
  }, [id]);

  useEffect(() => {
    if (!order) return;
    const m = order.payment?.method;
    const s = order.payment?.paymentStatus;

    if (m === "MIDTRANS") {
      setSelectedMethod("MIDTRANS");
      setShowUpload(false);
    } else if (m === "TRANSFER" && s === "PENDING") {
      setSelectedMethod("TRANSFER");
      setShowUpload(true);
    } else {
      setSelectedMethod(null);
      setShowUpload(false);
    }
  }, [order]);

  const onMidtrans = async () => {
    await payWithMidtrans(id);
  };

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert("Disalin ke clipboard");
    } catch {
      alert("Gagal menyalin");
    }
  };

  if (loading) return <p>Loading...</p>;
  if (err) return <p className="text-rose-600">{err}</p>;
  if (!order) return null;

  const orderNumber = `ORD-${order.id}-${new Date(order.createdAt).getTime()}`;

  const showActions = order.status === "WAITING_FOR_PAYMENT";

  const bank = order.roomType?.property?.destinationBank || "";
  const rek = order.roomType?.property?.noRekening || "";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-500">Nomor Pesanan</div>
          <div className="text-lg font-semibold">#{orderNumber}</div>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="rounded-lg border p-4 space-y-2">
        <h4 className="font-medium">Informasi Properti</h4>
        <div className="text-sm">
          <div className="font-medium">{order.roomType?.property?.name}</div>
          <div className="text-gray-500">
            {order.roomType?.roomName} • {order.roomType?.property?.city}
          </div>
          <div className="text-gray-500">
            {order.roomType?.property?.address}
          </div>
        </div>
        <div className="pt-2 text-sm space-y-1">
          <div>
            Tanggal: {new Date(order.checkInDate).toLocaleDateString()} —{" "}
            {new Date(order.checkOutDate).toLocaleDateString()}
          </div>
          <div>Jumlah kamar: {order.qty}</div>
          <div className="font-semibold">
            Total: Rp {order.totalPrice.toLocaleString("id-ID")}
          </div>
        </div>
      </div>

      <div className="rounded-lg border p-4 space-y-3">
        <h4 className="font-medium">Pembayaran</h4>
        <div className="text-sm space-y-1">
          <div>Metode: {order.payment?.method ?? "-"}</div>
          <div>Status: {order.payment?.paymentStatus ?? "-"}</div>
          {order.payment?.paymentProof && (
            <div>
              Bukti bayar:{" "}
              <span className="text-gray-600">
                <PaymentProofPreview
                  src={order.payment?.paymentProof ?? null}
                />
              </span>
            </div>
          )}
          {order.payment?.paymentUrl && order.status !== "CANCELLED" && (
            <a
              href={order.payment.paymentUrl}
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 underline"
            >
              Buka Link Pembayaran
            </a>
          )}
          {order.status === "CANCELLED" && order.payment?.paymentUrl && (
            <p className="text-xs text-gray-400">
              Link pembayaran dinonaktifkan karena pesanan dibatalkan.
            </p>
          )}
        </div>

        {showActions && (
          <>
            {!selectedMethod && (
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setSelectedMethod("TRANSFER");
                    setShowUpload(true);
                  }}
                  className="w-full rounded-md border border-blue-600 text-blue-600 px-4 py-2 hover:bg-blue-600 hover:text-white transition-colors"
                >
                  TRANSFER Bank (Upload Bukti)
                </button>
                <button
                  onClick={() => {
                    setSelectedMethod("MIDTRANS");
                    onMidtrans();
                  }}
                  className="w-full rounded-md border border-blue-600 text-blue-600 px-4 py-2 hover:bg-blue-600 hover:text-white transition-colors"
                >
                  Bayar via MIDTRANS
                </button>
              </div>
            )}

            {/* Jika user pilih upload bukti pembayaran */}
            {selectedMethod === "TRANSFER" && showUpload && (
              <div className="mt-3">
                <UploadPaymentProofFormik
                  orderId={order.id}
                  onDone={fetchOne}
                />
              </div>
            )}

            {showUpload && (
              <div className="mt-3 rounded-md border p-3 bg-gray-50">
                <div className="text-sm font-medium mb-2">
                  Info Transfer Manual
                </div>
                <div className="flex items-center justify-between gap-3 text-sm">
                  <div>
                    <div className="text-gray-500">Bank Tujuan</div>
                    <div className="font-medium">{bank || "—"}</div>
                  </div>
                  {bank && (
                    <button
                      onClick={() => copy(bank)}
                      className="rounded-md border px-2 py-1 text-xs hover:bg-white"
                    >
                      Salin
                    </button>
                  )}
                </div>
                <div className="mt-2 flex items-center justify-between gap-3 text-sm">
                  <div>
                    <div className="text-gray-500">No. Rekening</div>
                    <div className="font-medium">{rek || "—"}</div>
                  </div>
                  {rek && (
                    <button
                      onClick={() => copy(rek)}
                      className="rounded-md border px-2 py-1 text-xs hover:bg-white"
                    >
                      Salin
                    </button>
                  )}
                </div>
              </div>
            )}

            <div className="mt-4">
              <CancelOrderBtn orderId={order.id} onDone={fetchOne} />
            </div>
          </>
        )}
      </div>
      <ReviewSection
        transactionId={order.id}
        orderStatus={order.status}
        checkOutDateISO={order.checkOutDate}
      />
    </div>
  );
}
