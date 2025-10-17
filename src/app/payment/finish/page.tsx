// app/payment/finish/page.tsx
"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const labelFromStatus = (s?: string) => {
  switch ((s || "").toLowerCase()) {
    case "settlement":
    case "capture":
    case "success":
      return { text: "Pembayaran Berhasil", tone: "text-green-600" };
    case "pending":
      return {
        text: "Menunggu Pembayaran / Verifikasi",
        tone: "text-amber-600",
      };
    case "expire":
    case "expired":
      return { text: "Pembayaran Kadaluwarsa", tone: "text-gray-600" };
    case "deny":
    case "cancel":
      return { text: "Pembayaran Ditolak / Dibatalkan", tone: "text-red-600" };
    default:
      return { text: "Status Tidak Dikenal", tone: "text-muted-foreground" };
  }
};

export default function PaymentFinishPage() {
  const sp = useSearchParams();
  const router = useRouter();

  const orderId = sp.get("order_id") || "-";
  const statusCode = sp.get("status_code") || "-";
  const trxStatus = sp.get("transaction_status") || "-";

  const statusInfo = useMemo(() => labelFromStatus(trxStatus), [trxStatus]);

  return (
    <div className="p-4 max-w-3xl mx-auto space-y-4">
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Payment Result</CardTitle>
          <span className={`text-sm ${statusInfo.tone}`}>
            {statusInfo.text}
          </span>
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="grid sm:grid-cols-2 gap-2 text-sm">
            <Row label="Order ID" value={orderId} />
            <Row label="Status Code" value={statusCode} />
            <Row label="Transaction Status" value={trxStatus} />
          </div>

          <Hint trxStatus={trxStatus} />

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => router.push("/user/orders")}
            >
              Lihat Daftar Pesanan
            </Button>
            <Button variant="outline" onClick={() => router.push("/")}>
              Kembali ke Beranda
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2 border rounded-md px-3 py-2 bg-background">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  );
}

function Hint({ trxStatus }: { trxStatus: string }) {
  const s = (trxStatus || "").toLowerCase();
  if (s === "pending") {
    return (
      <div className="text-sm text-amber-600">
        Pembayaran masih <b>pending</b>. Jika kamu sudah membayar, tunggu
        sebentar dan cek halaman <b>Daftar Pesanan</b> untuk melihat status
        terbaru.
      </div>
    );
  }
  if (s === "settlement" || s === "capture" || s === "success") {
    return (
      <div className="text-sm text-green-600">
        Pembayaran <b>berhasil</b>! Kamu bisa melihat detail pemesanan di
        halaman <b>Daftar Pesanan</b>.
      </div>
    );
  }
  if (s === "expire" || s === "expired") {
    return (
      <div className="text-sm text-gray-600">
        Pesanan <b>kadaluwarsa</b>. Silakan lakukan pemesanan ulang bila masih
        ingin melanjutkan.
      </div>
    );
  }
  if (s === "deny" || s === "cancel") {
    return (
      <div className="text-sm text-red-600">
        Pembayaran <b>ditolak atau dibatalkan</b>. Coba ulangi proses pemesanan
        atau gunakan metode pembayaran lain.
      </div>
    );
  }
  return (
    <div className="text-sm text-muted-foreground">
      Status pembayaran tidak dikenali. Silakan cek kembali di halaman{" "}
      <b>Daftar Pesanan</b>.
    </div>
  );
}
