"use client";
import clsx from "clsx";
import { TransactionStatus } from "../lib/orders/types";

export default function StatusBadge({ status }: { status: TransactionStatus }) {
  const map: Record<TransactionStatus, string> = {
    WAITING_FOR_PAYMENT: "bg-yellow-100 text-yellow-800 border-yellow-300",
    WAITING_FOR_CONFIRMATION: "bg-blue-100 text-blue-800 border-blue-300",
    ACCEPTED: "bg-emerald-100 text-emerald-800 border-emerald-300",
    CANCELLED: "bg-rose-100 text-rose-800 border-rose-300",
  };
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border",
        map[status]
      )}
    >
      {status.replaceAll("_", " ")}
    </span>
  );
}
