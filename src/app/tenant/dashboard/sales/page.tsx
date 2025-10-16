// app/tenant/dashboard/sales/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { axios } from "@/lib/axios";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Stat from "@/components/report/stat";

const money = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);

export default function SalesReportPage() {
  const sp = useSearchParams();
  const router = useRouter();
  const groupBy = (sp.get("groupBy") || "property") as GroupBy;
  const sortBy = (sp.get("sortBy") || "revenue") as SortBy;
  const order = (sp.get("order") || "desc") as Order;
  const page = parseInt(sp.get("page") || "1") || 1;
  const limit = parseInt(sp.get("limit") || "10") || 10;
  const dateFrom = sp.get("dateFrom") || "";
  const dateTo = sp.get("dateTo") || "";
  const propertyId = sp.get("propertyId") || "";

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ApiResp | null>(null);

  const setQuery = (next: Record<string, string | number | undefined>) => {
    const q = new URLSearchParams(sp.toString());
    Object.entries(next).forEach(([k, v]) =>
      v ? q.set(k, String(v)) : q.delete(k)
    );
    if (!("page" in next)) q.set("page", "1");
    router.push(`?${q.toString()}`);
  };

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      try {
        const res = await axios.get<ApiResp>("/api/report/sales", {
          params: {
            groupBy,
            sortBy,
            order,
            page,
            limit,
            dateFrom: dateFrom || undefined,
            dateTo: dateTo || undefined,
            propertyId: propertyId || undefined,
          },
        });
        setData(res.data);
      } catch (e) {
        console.error(e);
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [groupBy, sortBy, order, page, limit, dateFrom, dateTo, propertyId]);

  const summary = data?.summary;
  const items: any[] = (data?.items as any[]) ?? [];
  const totalPages = data?.totalPages ?? 1;

  const columns = useMemo(() => {
    if (groupBy === "transaction")
      return [
        "Order Number",
        "Paid At",
        "Method",
        "Amount",
        "Property",
        "Room",
        "User",
      ];
    if (groupBy === "property")
      return [
        "Property",
        "City",
        "Revenue",
        "Count",
        "Transfer (rev/cnt)",
        "Midtrans (rev/cnt)",
        "Latest Paid",
      ];
    return [
      "User",
      "Email",
      "Revenue",
      "Count",
      "Transfer (rev/cnt)",
      "Midtrans (rev/cnt)",
      "Latest Paid",
    ];
  }, [groupBy]);

  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Sales Report</CardTitle>
          <span className="text-sm text-muted-foreground">
            {loading ? "Memuat..." : ""}
          </span>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Summary */}
          <div className="grid gap-3 sm:grid-cols-3">
            <Stat
              title="Total Revenue"
              value={summary ? money(summary.totalRevenue) : "-"}
            />
            <Stat
              title="Transactions"
              value={summary ? summary.countTransaction : "-"}
            />
            <Stat
              title="By Method"
              value={
                summary
                  ? `Transfer ${money(summary.byMethod.TRANSFER.revenue)} (${
                      summary.byMethod.TRANSFER.count
                    }) • Midtrans ${money(
                      summary.byMethod.MIDTRANS.revenue
                    )} (${summary.byMethod.MIDTRANS.count})`
                  : "-"
              }
            />
          </div>

          {/* Filter */}
          <div className="grid gap-3 md:grid-cols-6">
            <div className="flex flex-col gap-1">
              <Label htmlFor="groupBy">Group By</Label>
              <select
                id="groupBy"
                className="border h-9 px-2 rounded-md"
                value={groupBy}
                onChange={(e) => setQuery({ groupBy: e.target.value })}
              >
                <option value="property">Property</option>
                <option value="transaction">Transaction</option>
                <option value="user">User</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <Label htmlFor="sortBy">Sort By</Label>
              <select
                id="sortBy"
                className="border h-9 px-2 rounded-md"
                value={sortBy}
                onChange={(e) => setQuery({ sortBy: e.target.value })}
              >
                <option value="revenue">Revenue</option>
                <option value="date">Date</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <Label htmlFor="order">Order</Label>
              <select
                id="order"
                className="border h-9 px-2 rounded-md"
                value={order}
                onChange={(e) => setQuery({ order: e.target.value })}
              >
                <option value="asc">ASC</option>
                <option value="desc">DESC</option>
              </select>
            </div>

            {groupBy === "transaction" ? (
              <div className="flex flex-col gap-1">
                <Label htmlFor="dateFrom">From</Label>
                <Input
                  id="dateFrom"
                  type="date"
                  value={dateFrom}
                  onChange={(e) =>
                    setQuery({ dateFrom: e.target.value || undefined })
                  }
                />
              </div>
            ) : (
              ""
            )}

            {groupBy === "transaction" ? (
              <div className="flex flex-col gap-1">
                <Label htmlFor="dateTo">To</Label>
                <Input
                  id="dateTo"
                  type="date"
                  value={dateTo}
                  onChange={(e) =>
                    setQuery({ dateTo: e.target.value || undefined })
                  }
                />
              </div>
            ) : (
              ""
            )}
          </div>

          <div className="overflow-x-auto border rounded-lg">
            <table className="min-w-[720px] w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {columns.map((c) => (
                    <th key={c} className="text-left px-3 py-2 font-medium">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {!loading && items.length === 0 && (
                  <tr>
                    <td
                      className="px-3 py-6 text-center text-muted-foreground"
                      colSpan={columns.length}
                    >
                      No data
                    </td>
                  </tr>
                )}
                {items.map((it: any, i: number) =>
                  groupBy === "transaction" ? (
                    <tr key={i} className="border-t">
                      <td className="px-3 py-2">{it.orderNumber}</td>
                      <td className="px-3 py-2">
                        {it.paidAt ? new Date(it.paidAt).toLocaleString() : "-"}
                      </td>
                      <td className="px-3 py-2">{it.method}</td>
                      <td className="px-3 py-2">{money(it.amount)}</td>
                      <td className="px-3 py-2">
                        {it.property
                          ? `${it.property.name} (${it.property.city})`
                          : "-"}
                      </td>
                      <td className="px-3 py-2">{it.roomName || "-"}</td>
                      <td className="px-3 py-2">
                        {it.user
                          ? `${it.user.username || "-"} (${
                              it.user.email || "-"
                            })`
                          : "-"}
                      </td>
                    </tr>
                  ) : (
                    <tr key={i} className="border-t">
                      <td className="px-3 py-2">
                        {it.key
                          ? "propertyId" in it.key
                            ? `${it.key.name} #${it.key.propertyId}`
                            : `${it.key.username || "-"} #${it.key.userId}`
                          : "-"}
                      </td>
                      <td className="px-3 py-2">
                        {it.key
                          ? "propertyId" in it.key
                            ? it.key.city
                            : it.key.email || "-"
                          : "-"}
                      </td>
                      <td className="px-3 py-2">{money(it.revenue)}</td>
                      <td className="px-3 py-2">{it.countTransaction}</td>
                      <td className="px-3 py-2">
                        {money(it.byMethod?.TRANSFER?.revenue ?? 0)} (
                        {it.byMethod?.TRANSFER?.count ?? 0})
                      </td>
                      <td className="px-3 py-2">
                        {money(it.byMethod?.MIDTRANS?.revenue ?? 0)} (
                        {it.byMethod?.MIDTRANS?.count ?? 0})
                      </td>
                      <td className="px-3 py-2">
                        {it.latestPaidAt
                          ? new Date(it.latestPaidAt).toLocaleString()
                          : "-"}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              disabled={page <= 1 || loading}
              onClick={() => setQuery({ page: page - 1 })}
            >
              Prev
            </Button>
            <div className="text-sm">
              Page <b>{page}</b> of <b>{totalPages}</b>
            </div>
            <Button
              variant="outline"
              disabled={page >= totalPages || loading}
              onClick={() => setQuery({ page: page + 1 })}
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
