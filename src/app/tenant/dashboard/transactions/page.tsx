"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { axios } from "@/lib/axios";
import StatusBadge from "@/components/statusBadge";
import {
  TenantOrderDetail,
  TenantOrderItem,
  TenantOrderListResponse,
} from "@/lib/transaction/type";
import TransactionDetailModal from "@/components/modal/transactionDetail/transactionDetail";
import ProtectedPage from "@/components/protectedPage";

export default function TenantTransactionsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const [data, setData] = useState<TenantOrderListResponse>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    items: [],
  });
  const [loading, setLoading] = useState(false);

  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detail, setDetail] = useState<TenantOrderDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailErr, setDetailErr] = useState<string | null>(null);

  const page = Number(sp.get("page") || 1);
  const limit = Number(sp.get("limit") || 10);
  const status = sp.get("status") || "";
  const q = sp.get("q") || "";
  const from = sp.get("from") || "";
  const to = sp.get("to") || "";

  const setParam = (k: string, v?: string) => {
    const usp = new URLSearchParams(sp.toString());
    if (v) usp.set(k, v);
    else usp.delete(k);
    if (k !== "page") usp.set("page", "1");
    router.replace(`${pathname}?${usp.toString()}`);
  };

  const fetchList = async () => {
    setLoading(true);
    try {
      const res = await axios.get<TenantOrderListResponse>(
        "/api/transaction/tenant/orders",
        {
          params: {
            page,
            limit,
            status,
            dateFrom: from,
            dateTo: to,
            q,
          },
        }
      );
      setData(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const openDetail = async (id: number) => {
    setSelectedId(id);
    setOpen(true);
    setDetail(null);
    setDetailErr(null);
    setDetailLoading(true);
    try {
      const res = await axios.get<{ message: string; data: TenantOrderDetail }>(
        `/api/transaction/tenant/orders/${id}`
      );
      setDetail(res.data.data);
    } catch (e: any) {
      setDetailErr(
        e?.response?.data?.error || e.message || "Gagal memuat detail"
      );
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, [page, limit, status, q, from, to]);

  const last = useMemo(
    () => (data ? Math.max(1, Math.ceil(data.total / data.limit)) : 1),
    [data]
  );

  const refreshList = async () => {
    await fetchList();
  };

  return (
    <ProtectedPage role="TENANT">
      <div className="mx-auto w-full max-w-screen-xl px-3 sm:px-4 lg:px-6 py-6 space-y-6">
        <h1 className="text-2xl font-semibold">Transaksi Tenant</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2 sm:gap-3">
          <input
            placeholder="Cari (Order ID)"
            defaultValue={q}
            onKeyDown={(e) =>
              e.key === "Enter" && setParam("q", (e.target as any).value)
            }
            className="rounded-md border px-3 py-2 text-sm min-w-0"
          />
          <select
            className="rounded-md border px-3 py-2 text-sm min-w-0"
            value={status}
            onChange={(e) => setParam("status", e.target.value || undefined)}
          >
            <option value="">Semua status</option>
            <option value="WAITING_FOR_PAYMENT">Menunggu Pembayaran</option>
            <option value="WAITING_FOR_CONFIRMATION">
              Menunggu Konfirmasi
            </option>
            <option value="ACCEPTED">Diterima</option>
            <option value="CANCELLED">Dibatalkan</option>
          </select>
          <input
            type="date"
            className="rounded-md border px-3 py-2 text-sm min-w-0"
            value={from}
            onChange={(e) => setParam("from", e.target.value || undefined)}
          />
          <input
            type="date"
            className="rounded-md border px-3 py-2 text-sm min-w-0"
            value={to}
            onChange={(e) => setParam("to", e.target.value || undefined)}
          />
          <div className="hidden md:block" />
        </div>

        <div className="overflow-x-auto rounded-lg border">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left">
                <th className="px-3 sm:px-4 py-2">Order</th>
                <th className="px-3 sm:px-4 py-2">Properti / Kamar</th>
                <th className="px-3 sm:px-4 py-2">Tanggal</th>
                <th className="px-3 sm:px-4 py-2">Qty</th>
                <th className="px-3 sm:px-4 py-2">Total</th>
                <th className="px-3 sm:px-4 py-2">Status</th>
                <th className="px-3 sm:px-4 py-2">Aksi</th>
                <th className="px-3 sm:px-4 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading && (
                <tr>
                  <td colSpan={8} className="px-3 sm:px-4 py-6 text-center">
                    Loading...
                  </td>
                </tr>
              )}
              {!loading &&
                data.items.map((o: TenantOrderItem) => (
                  <tr key={o.id}>
                    <td className="px-3 sm:px-4 py-3 font-medium break-words">
                      {o.orderNumber}
                    </td>
                    <td className="px-3 sm:px-4 py-3">
                      <div className="font-medium">
                        {o.property?.name ?? "-"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {o.roomName ?? "-"} • {o.property?.city ?? "-"}
                      </div>
                    </td>
                    <td className="px-3 sm:px-4 py-3 whitespace-nowrap">
                      {new Date(o.checkInDate).toLocaleDateString()} —{" "}
                      {new Date(o.checkOutDate).toLocaleDateString()}
                    </td>
                    <td className="px-3 sm:px-4 py-3">{o.qty}</td>
                    <td className="px-3 sm:px-4 py-3 whitespace-nowrap">
                      Rp {o.totalPrice.toLocaleString("id-ID")}
                    </td>
                    <td className="px-3 sm:px-4 py-3">
                      <StatusBadge status={o.status} />
                    </td>
                    <td className="px-3 sm:px-4 py-3">
                      <button
                        onClick={() => openDetail(o.id)}
                        className="w-full sm:w-auto rounded-md border px-3 py-1 text-sm hover:bg-gray-50"
                      >
                        Detail
                      </button>
                    </td>
                  </tr>
                ))}
              {!loading && data.items.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-3 sm:px-4 py-6 text-center text-gray-500"
                  >
                    Tidak ada data
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {data && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <p className="text-xs sm:text-sm text-gray-500">
              Page {data.page} dari {last} • Total {data.total}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setParam("page", String(Math.max(1, page - 1)))}
                className="border rounded-md px-3 py-2 sm:py-1 text-sm hover:bg-gray-50"
              >
                Prev
              </button>
              <button
                onClick={() =>
                  setParam("page", String(Math.min(last, page + 1)))
                }
                className="border rounded-md px-3 py-2 sm:py-1 text-sm hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}

        <TransactionDetailModal
          open={open}
          onClose={() => setOpen(false)}
          id={selectedId}
          onChanged={refreshList}
        />
      </div>
    </ProtectedPage>
  );
}
