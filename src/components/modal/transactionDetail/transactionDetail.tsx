"use client";

import { useEffect, useState, useMemo } from "react";
import Modal from "@/components/modal/modal";
import StatusBadge from "@/components/statusBadge";
import { axios } from "@/lib/axios";
import { TenantOrderDetail } from "@/lib/transaction/type";
import PaymentProofPreview from "@/components/transaction/previewPaymentProof";
import AcceptPaymentBtnTenant from "@/components/transaction/acceptTransaction";
import RejectPaymentBtnTenant from "@/components/transaction/rejectTransaction";
import CancelOrderBtnTenant from "@/components/transaction/cancelTransaction";

type Props = {
  open: boolean;
  onClose: () => void;
  id: number | null;
  onChanged?: () => void;
};

export default function TransactionDetailModal({
  open,
  onClose,
  id,
  onChanged,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState<TenantOrderDetail | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const canCancel = useMemo(
    () =>
      detail?.status === "WAITING_FOR_PAYMENT" &&
      (detail?.payment?.paymentStatus ?? "") !== "SETTLEMENT",
    [detail]
  );

  const canConfirmReject = useMemo(
    () =>
      detail?.status === "WAITING_FOR_CONFIRMATION" &&
      detail?.payment?.method === "TRANSFER" &&
      (detail?.payment?.paymentStatus ?? "") === "PENDING",
    [detail]
  );

  const fetchDetail = async () => {
    if (!id) return;
    setLoading(true);
    setErr(null);
    setDetail(null);
    try {
      const res = await axios.get<{ message: string; data: TenantOrderDetail }>(
        `/api/transaction/tenant/orders/${id}`
      );
      setDetail(res.data.data);
    } catch (e: any) {
      setErr(e?.response?.data?.error || e.message || "Gagal memuat detail");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && id) fetchDetail();
  }, [open, id]);

  const afterAction = async () => {
    await fetchDetail();
    onChanged?.();
  };

  return (
    <Modal open={open} onClose={onClose} title="Detail Transaksi">
      {loading && <p>Loading...</p>}
      {err && <p className="text-rose-600">{err}</p>}

      {detail && (
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs text-gray-500">Status</div>
              <div className="mt-1">
                <StatusBadge status={detail.status} />
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500">Total</div>
              <div className="text-lg font-semibold text-blue-600">
                Rp {detail.totalPrice.toLocaleString("id-ID")}
              </div>
            </div>
          </div>

          <div className="rounded-lg border p-3">
            <div className="text-sm">
              <div className="font-medium">
                {detail.roomType?.property?.name ?? "-"}
              </div>
              <div className="text-xs text-gray-500">
                {detail.roomType?.roomName ?? "-"} •{" "}
                {detail.roomType?.property?.city ?? "-"}
              </div>
              <div className="text-xs text-gray-500">
                {detail.roomType?.property?.address ?? "-"}
              </div>
              <div className="mt-2 text-sm">
                Tanggal: {new Date(detail.checkInDate).toLocaleDateString()} —{" "}
                {new Date(detail.checkOutDate).toLocaleDateString()}
              </div>
              <div className="text-sm">Qty: {detail.qty}</div>
            </div>
          </div>

          <div className="rounded-lg border p-3">
            <h4 className="font-medium mb-2">Bukti Pembayaran</h4>
            <PaymentProofPreview src={detail.payment?.paymentProof ?? null} />
            <div className="mt-3 text-sm text-gray-700 space-y-1">
              <div>Metode: {detail.payment?.method ?? "-"}</div>
              <div>Status: {detail.payment?.paymentStatus ?? "-"}</div>
              {detail.payment?.paidAt && (
                <div>
                  Dibayar pada:{" "}
                  {new Date(detail.payment.paidAt).toLocaleString("id-ID")}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            {canCancel && detail.id && (
              <CancelOrderBtnTenant orderId={detail.id} onDone={afterAction} />
            )}
            {canConfirmReject && detail.id && (
              <>
                <AcceptPaymentBtnTenant
                  orderId={detail.id}
                  onDone={afterAction}
                />
                <RejectPaymentBtnTenant
                  orderId={detail.id}
                  onDone={afterAction}
                />
              </>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}
