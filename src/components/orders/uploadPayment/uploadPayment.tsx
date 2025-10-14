"use client";
import { Formik, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import { axios } from "@/lib/axios";
import { useState } from "react";
import { useRouter } from "next/navigation";

const MAX_SIZE = 1_000_000; // 1MB
const ALLOWED = ["image/jpeg", "image/png"];

const paymentProofSchema = Yup.object().shape({
  pp: Yup.mixed<File>()
    .required("File bukti pembayaran wajib diunggah")
    .test("fileType", "File harus .jpg atau .png", (file) =>
      file ? ALLOWED.includes(file.type) : false
    )
    .test("fileSize", "Ukuran file maksimal 1MB", (file) =>
      file ? file.size <= MAX_SIZE : false
    ),
  transactionId: Yup.number()
    .typeError("transactionId tidak valid")
    .positive("transactionId harus positif")
    .required("transactionId wajib"),
});

export default function UploadPaymentProofFormik({
  orderId,
  onDone,
}: {
  orderId: number;
  onDone?: () => void;
}) {
  const [serverErr, setServerErr] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const router = useRouter();

  return (
    <div className="rounded-lg border p-4">
      <h4 className="font-medium mb-3">Upload Bukti Pembayaran</h4>
      <Formik
        initialValues={{
          pp: undefined as unknown as File,
          transactionId: orderId,
        }}
        validationSchema={paymentProofSchema}
        onSubmit={async (values, { setSubmitting, resetForm }) => {
          setServerErr(null);
          setSuccessMsg(null);
          try {
            const fd = new FormData();
            fd.append("file", values.pp);
            fd.append("transactionId", String(values.transactionId));

            const res = await axios.post("/api/payment/manual", fd, {
              headers: { "Content-Type": "multipart/form-data" },
            });
            setSuccessMsg(
              res.data?.message ||
                "Bukti pembayaran terunggah. Menunggu konfirmasi."
            );
            onDone?.();
            resetForm();
            router.push("/user/orders");
          } catch (e: unknown) {
            const error = e as {
              response?: { data?: { error?: string; message?: string } };
              message?: string;
            };
            const msg =
              error.response?.data?.error ||
              error.response?.data?.message ||
              error.message ||
              "Gagal mengunggah bukti bayar";
            setServerErr(msg);
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ isSubmitting, setFieldValue, setFieldTouched, getFieldProps }) => (
          <Form className="space-y-3">
            <input type="hidden" {...getFieldProps("transactionId")} readOnly />

            <div>
              <label className="block text-sm font-medium mb-1">
                File (JPG/PNG, ≤1MB)
              </label>
              <input
                id="pp"
                name="pp"
                type="file"
                accept="image/jpeg,image/png"
                onChange={(e) => {
                  const file = e.currentTarget.files?.[0];
                  setFieldValue("pp", file);
                }}
                onBlur={() => setFieldTouched("pp", true)}
                className="block w-full text-sm file:mr-4 file:rounded-md file:border file:px-3 file:py-1 file:bg-gray-50"
              />
              <ErrorMessage
                name="pp"
                component="div"
                className="mt-1 text-sm text-rose-600"
              />
            </div>

            {serverErr && <p className="text-sm text-rose-600">{serverErr}</p>}
            {successMsg && (
              <p className="text-sm text-emerald-600">{successMsg}</p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-black text-white px-3 py-2 disabled:opacity-50"
            >
              {isSubmitting ? "Mengunggah..." : "Upload Bukti"}
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
}
