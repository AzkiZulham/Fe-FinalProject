// lib/payments/midtrans.ts
"use client";

import { axios } from "@/lib/axios";
import toast from "react-hot-toast";

export type MidtransCreateResp = {
  token: string;
  redirect_url: string;
  orderId: string;
};

type Options = {
  autoRedirect?: boolean;
  withToast?: boolean;
};

export async function payWithMidtrans(
  transactionId: number,
  opts: Options = {}
): Promise<MidtransCreateResp> {
  const { autoRedirect = true, withToast = true } = opts;

  try {
    const resp = await axios.post<MidtransCreateResp>(
      "/api/payment/midtrans/create",
      { transactionId }
    );

    const data = resp.data;
    if (!data?.redirect_url) {
      throw new Error("Redirect URL tidak tersedia dari Midtrans");
    }

    if (withToast) toast.success("Mengarahkan ke halaman pembayaran…");

    if (autoRedirect) {
      window.location.href = data.redirect_url;
    }

    return data;
  } catch (e: any) {
    const msg =
      e?.response?.data?.error ||
      e?.response?.data?.message ||
      e?.message ||
      "Gagal membuat pembayaran Midtrans";
    if (withToast) toast.error(msg);
    throw e;
  }
}
