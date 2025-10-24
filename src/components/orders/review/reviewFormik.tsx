"use client";
import { useEffect, useMemo, useState } from "react";
import { Formik, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import { axios } from "@/lib/axios";
import { TransactionStatus } from "@/lib/orders/types";
import toast from "react-hot-toast";

type ReviewData = {
  id: number;
  comment: string | null;
  tenantReply: string | null;
  createdAt: string;
} | null;

const schema = Yup.object({
  comment: Yup.string()
    .trim()
    .min(5, "Minimal 5 karakter")
    .max(1000, "Maksimal 1000 karakter")
    .required("Komentar wajib diisi"),
});

export default function ReviewSection({
  transactionId,
  orderStatus,
  checkOutDateISO,
}: {
  transactionId: number;
  orderStatus: TransactionStatus;
  checkOutDateISO: string;
}) {
  const [loading, setLoading] = useState(false);
  const [review, setReview] = useState<ReviewData>(null);
  const [serverMsg, setServerMsg] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);

  const canWrite = useMemo(() => {
    const afterCheckout = new Date(checkOutDateISO).getTime() < Date.now();
    return orderStatus === "ACCEPTED" && afterCheckout && !review;
  }, [orderStatus, checkOutDateISO, review]);

  const fetchReview = async () => {
    setLoading(true);
    setServerMsg(null);
    try {
      const res = await axios.get<{ message: string; data: ReviewData }>(
        `/api/review/${transactionId}`
      );
      setReview(res.data.data ?? null);
    } catch (e: any) {
      if (e?.response?.status !== 404) {
        setServerMsg({
          type: "error",
          text: e.message || "Gagal memuat review",
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
    <div className="rounded-lg border p-4 space-y-3">
      <h4 className="font-medium">Review</h4>

      {loading && <p className="text-sm text-gray-500">Memuat...</p>}

      {!loading && review && (
        <div className="space-y-2">
          <div>
            <div className="text-xs text-gray-500">Komentar Anda</div>
            <div className="rounded-md border bg-gray-50 p-3 text-sm">
              {review.comment || "-"}
            </div>
          </div>
          {review.tenantReply && (
            <div>
              <div className="text-xs text-gray-500">Balasan Tenant</div>
              <div className="rounded-md border bg-white p-3 text-sm">
                {review.tenantReply}
              </div>
            </div>
          )}
        </div>
      )}

      {!loading && canWrite && (
        <Formik
          initialValues={{ comment: "" }}
          validationSchema={schema}
          onSubmit={async (values, { setSubmitting, resetForm }) => {
            setServerMsg(null);
            try {
              const res = await axios.post(`/api/review/`, {
                transactionId,
                comment: values.comment.trim(),
              });
              toast.success(res.data?.message || "Review tersimpan.");
              resetForm();
              await fetchReview();
            } catch (e: any) {
              const msg =
                e?.response?.data?.error ||
                e?.response?.data?.message ||
                e?.message ||
                "Gagal menyimpan review.";
              toast.error(msg);
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
                  Komentar
                </label>
                <textarea
                  {...getFieldProps("comment")}
                  rows={4}
                  placeholder="Ceritakan pengalaman menginap Anda…"
                  className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-900"
                />
                <ErrorMessage
                  name="comment"
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

              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-md bg-black text-white px-3 py-2 text-sm disabled:opacity-50"
              >
                {isSubmitting ? "Menyimpan..." : "Kirim Review"}
              </button>
            </Form>
          )}
        </Formik>
      )}

      {!loading && !review && !canWrite && (
        <p className="text-sm text-gray-500">
          Anda dapat menulis review setelah status <b>ACCEPTED</b> dan melewati
          tanggal <b>check-out</b>.
        </p>
      )}
    </div>
  );
}
