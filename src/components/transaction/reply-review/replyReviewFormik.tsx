"use client";

import { useEffect, useMemo, useState } from "react";
import { Formik, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import { axios } from "@/lib/axios";
import type { TransactionStatus } from "@/lib/orders/types";

type ReviewData = {
  id: number;
  comment: string | null;
  tenantReply: string | null;
  createdAt: string;
} | null;

const schema = Yup.object({
  reply: Yup.string()
    .trim()
    .min(3, "Minimal 3 karakter")
    .max(1000, "Maksimal 1000 karakter")
    .required("Balasan wajib diisi"),
});

export default function ReplyReviewFormik({
  transactionId,
  orderStatus,
  checkOutDateISO,
  onDone,
}: {
  transactionId: number;
  orderStatus: TransactionStatus;
  checkOutDateISO: string;
  onDone?: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [review, setReview] = useState<ReviewData>(null);
  const [serverMsg, setServerMsg] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);

  const afterCheckout = useMemo(
    () => new Date(checkOutDateISO).getTime() < Date.now(),
    [checkOutDateISO]
  );

  const canReply = useMemo(
    () => orderStatus === "ACCEPTED" && afterCheckout && !!review?.id,
    [orderStatus, afterCheckout, review]
  );

  const fetchReview = async () => {
    setLoading(true);
    setServerMsg(null);
    setReview(null);
    try {
      const res = await axios.get<{ message: string; data: ReviewData }>(
        `/api/review/${transactionId}`
      );
      setReview(res.data.data ?? null);
    } catch (e: any) {
      if (e?.response?.status !== 404) {
        setServerMsg({
          type: "error",
          text: e?.response?.data?.error || e.message || "Gagal memuat review",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReview();
  }, [transactionId]);

  return (
    <div className="rounded-lg border p-3 space-y-3">
      <h4 className="font-medium">Review</h4>

      {loading && <p className="text-sm text-gray-500">Memuat review…</p>}

      {!loading && review && (
        <div className="space-y-2">
          <div>
            <div className="text-xs text-gray-500">Komentar Pengguna</div>
            <div className="rounded-md border bg-gray-50 p-3 text-sm">
              {review.comment || "-"}
            </div>
          </div>

          {review.tenantReply && (
            <div>
              <div className="text-xs text-gray-500">
                Balasan Tenant (sebelumnya)
              </div>
              <div className="rounded-md border bg-white p-3 text-sm">
                {review.tenantReply}
              </div>
            </div>
          )}
        </div>
      )}

      {!loading && canReply && review && (
        <Formik
          initialValues={{ reply: review.tenantReply || "" }}
          enableReinitialize
          validationSchema={schema}
          onSubmit={async (values, { setSubmitting }) => {
            setServerMsg(null);
            try {
              await axios.patch(`/api/review/${review.id}/reply`, {
                reply: values.reply.trim(),
              });
              setServerMsg({ type: "success", text: "Balasan terkirim." });
              await fetchReview();
              onDone?.();
            } catch (e: any) {
              const msg =
                e?.response?.data?.error ||
                e?.response?.data?.message ||
                e?.message ||
                "Gagal mengirim balasan.";
              setServerMsg({ type: "error", text: msg });
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ isSubmitting, getFieldProps }) => (
            <Form className="space-y-2">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Balasan Tenant
                </label>
                <textarea
                  rows={4}
                  placeholder="Tulis tanggapan Anda kepada tamu…"
                  className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-900"
                  {...getFieldProps("reply")}
                />
                <ErrorMessage
                  name="reply"
                  component="div"
                  className="text-sm text-rose-600 mt-1"
                />
              </div>

              {serverMsg && (
                <p
                  className={`text-sm ${
                    serverMsg.type === "error"
                      ? "text-rose-600"
                      : "text-emerald-600"
                  }`}
                >
                  {serverMsg.text}
                </p>
              )}

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={isSubmitting || !review?.id}
                  className="rounded-md bg-black text-white px-4 py-2 text-sm disabled:opacity-50"
                >
                  {isSubmitting ? "Menyimpan..." : "Kirim Balasan"}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      )}

      {!loading && !review && (
        <p className="text-sm text-gray-500">Belum ada review dari pengguna.</p>
      )}

      {!loading && review && !canReply && (
        <p className="text-xs text-gray-500">
          Balasan tersedia setelah status <b>ACCEPTED</b> dan melewati tanggal{" "}
          <b>check-out</b>.
        </p>
      )}
    </div>
  );
}
