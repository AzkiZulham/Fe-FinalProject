"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { axios } from "@/src/lib/axios";
import StatusBadge from "@/src/components/statusBadge";
import { UserOrderResponse } from "@/src/lib/orders/types";

export default function OrdersClient() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const [data, setData] = useState<UserOrderResponse>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    items: [],
  });
  const [loading, setLoading] = useState(false);

  const page = Number(sp.get("page") || 1);
  const limit = Number(sp.get("limit") || 10);
  const status = sp.get("status") || "";
  const q = sp.get("q") || "";
  const from = sp.get("from") || "";
  const to = sp.get("to") || "";

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get<UserOrderResponse>(
        "/transaction/user/orders",
        {
          params: { page, limit, status, dateFrom: from, dateTo: to, q },
        }
      );
      setData(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, limit, status, q, from, to]);

  const setParam = (k: string, v?: string) => {
    const usp = new URLSearchParams(sp.toString());
    if (v) usp.set(k, v);
    else usp.delete(k);
    usp.set("page", "1");
    router.replace(`${pathname}?${usp.toString()}`);
  };

  const last = useMemo(
    () => (data ? Math.max(1, Math.ceil(data.total / data.limit)) : 1),
    [data]
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 space-y-6">
      <h1 className="text-2xl font-semibold">Pesanan Saya</h1>

      <div className="grid gap-3 md:grid-cols-5">
        <input
          placeholder="Cari (order no / properti)"
          defaultValue={q}
          onKeyDown={(e) =>
            e.key === "Enter" && setParam("q", (e.target as any).value)
          }
          className="col-span-2 rounded-md border px-3 py-2"
        />
        <select
          className="rounded-md border px-3 py-2"
          value={status}
          onChange={(e) => setParam("status", e.target.value || undefined)}
        >
          <option value="">Semua status</option>
          <option value="WAITING_FOR_PAYMENT">Menunggu Pembayaran</option>
          <option value="WAITING_FOR_CONFIRMATION">Menunggu Konfirmasi</option>
          <option value="ACCEPTED">Diterima</option>
          <option value="CANCELLED">Dibatalkan</option>
        </select>
        <input
          type="date"
          className="rounded-md border px-3 py-2"
          value={from}
          onChange={(e) => setParam("from", e.target.value || undefined)}
        />
        <input
          type="date"
          className="rounded-md border px-3 py-2"
          value={to}
          onChange={(e) => setParam("to", e.target.value || undefined)}
        />
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr className="text-left">
              <th className="px-4 py-2">Order</th>
              <th className="px-4 py-2">Properti / Kamar</th>
              <th className="px-4 py-2">Tanggal</th>
              <th className="px-4 py-2">Qty</th>
              <th className="px-4 py-2">Total</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center">
                  Loading...
                </td>
              </tr>
            )}
            {!loading &&
              data.items.map((o) => (
                <tr key={o.id}>
                  <td className="px-4 py-3 font-medium">{o.orderNumber}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{o.property.name}</div>
                    <div className="text-xs text-gray-500">
                      {o.roomName} • {o.property.city}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      {new Date(o.checkInDate).toLocaleDateString()} —{" "}
                      {new Date(o.checkOutDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-4 py-3">{o.qty}</td>
                  <td className="px-4 py-3">
                    Rp {o.totalPrice.toLocaleString("id-ID")}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={o.status as any} />
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/user/orders/${o.id}`}
                      className="rounded-md border px-3 py-1 hover:bg-gray-50"
                    >
                      Detail
                    </Link>
                  </td>
                </tr>
              ))}
            {!loading && data && data.items.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-gray-500">
                  Tidak ada data
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {data && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Page {data.page} dari {last} • Total {data.total}
          </p>
          <div className="inline-flex gap-2">
            <button
              onClick={() => setParam("page", String(Math.max(1, page - 1)))}
              className="border rounded-md px-3 py-1 hover:bg-gray-50"
            >
              Prev
            </button>
            <button
              onClick={() => setParam("page", String(Math.min(last, page + 1)))}
              className="border rounded-md px-3 py-1 hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
