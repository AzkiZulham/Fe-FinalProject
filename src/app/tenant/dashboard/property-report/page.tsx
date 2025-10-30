"use client";

export const dynamic = 'force-dynamic';

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import type { DatesSetArg, EventContentArg } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { axios } from "@/lib/axios";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import ProtectedPage from "@/components/protectedPage";

export default function PropertyReportPage() {
  const calRef = useRef<FullCalendar | null>(null);

  const [properties, setProperties] = useState<Property[]>([]);
  const [propertyId, setPropertyId] = useState<string>("");

  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [roomTypeId, setRoomTypeId] = useState<string>("");

  const [range, setRange] = useState<{ start: string; end: string }>(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString()
      .slice(0, 10);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 1)
      .toISOString()
      .slice(0, 10);
    return { start, end };
  });

  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<RoomReport[]>([]);
  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get<{ items: Property[] }>(
          "/api/report/tenant-property"
        );
        const list = res.data.items || [];
        setProperties(list);
        if (!propertyId && list.length) {
          setPropertyId(String(list[0].id));
        }
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  useEffect(() => {
    if (!propertyId) {
      setRoomTypes([]);
      setRoomTypeId("");
      return;
    }
    (async () => {
      try {
        const res = await axios.get<{ items: RoomType[] }>(
          "/api/report/tenant-roomtype",
          { params: { propertyId } }
        );
        const resData = res.data.items || [];
        setRoomTypes(res.data.items || []);
        setRoomTypeId((prev) =>
          prev && resData.some((r) => String(r.id) === prev)
            ? prev
            : resData[0]
            ? String(resData[0].id)
            : ""
        );
      } catch (e) {
        console.error(e);
        setRoomTypes([]);
        setRoomTypeId("");
      }
    })();
  }, [propertyId]);

  useEffect(() => {
    if (!roomTypeId) {
      setItems([]);
      return;
    }
    (async () => {
      setLoading(true);
      try {
        const res = await axios.get<ApiRespProperty>(
          "/api/report/property-availability",
          {
            params: {
              roomTypeId,
              start: range.start,
              end: range.end,
            },
          }
        );
        setItems(res.data.items || []);
      } catch (e) {
        console.error(e);
        setItems([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [roomTypeId, range.start, range.end]);

  const events = useMemo(() => {
    const out: any[] = [];
    if (!roomTypeId) return out;

    const target = items.find((it) => String(it.roomTypeId) === roomTypeId);
    if (!target) return out;

    for (const d of target.perDate) {
      const full = d.status === "FULL";
      const peak = d.isPeakSeason;
      out.push({
        start: d.date,
        end: d.date,
        allDay: true,
        title: `${target.roomName}: ${d.reserved}/${d.quota}`,
        extendedProps: {
          roomName: target.roomName,
          reserved: d.reserved,
          remaining: d.remaining,
          peak,
        },
        backgroundColor: full ? "#fee2e2" : peak ? "#fef3c7" : "#dcfce7",
        borderColor: full ? "#dc2626" : peak ? "#f59e0b" : "#16a34a",
      });
    }
    return out;
  }, [items, roomTypeId]);

  const handleDatesSet = (arg: DatesSetArg) => {
    const start = arg.startStr.slice(0, 10);
    const end = arg.endStr.slice(0, 10);
    setRange({ start, end });
  };

  const renderEventContent = (arg: EventContentArg) => {
    const p = arg.event.extendedProps as any;
    return (
      <div className="flex flex-col items-center text-black text-[11px] leading-tight h-8">
        <div className="flex flex-row gap-2">
          <p>Reserved: </p> <b>{p.reserved}</b>|<p>Remaining: </p>{" "}
          <b>{p.remaining}</b>
        </div>
        {p.peak ? <div className="italic opacity-70">Peak season</div> : null}
      </div>
    );
  };

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProtectedPage role="TENANT">
        <div className="p-4 space-y-4">
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Availability Calendar</CardTitle>
              <span className="text-sm text-muted-foreground">
                {loading ? "Memuat..." : ""}
              </span>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-6 gap-3">
                <div className="flex flex-col gap-1">
                  <Label htmlFor="property">Property</Label>
                  <select
                    id="property"
                    value={propertyId}
                    onChange={(e) => setPropertyId(e.target.value)}
                    className="border rounded-md px-2 py-2 text-sm"
                  >
                    {properties.length === 0 && (
                      <option value="">(Tidak ada properti)</option>
                    )}
                    {properties.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} — {p.city}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <Label htmlFor="room">Room Type</Label>
                  <select
                    id="room"
                    value={roomTypeId}
                    onChange={(e) => setRoomTypeId(e.target.value)}
                    className="border rounded-md px-2 py-2 text-sm"
                    disabled={!propertyId}
                  >
                    <option value="">Pilih Room Type</option>
                    {roomTypes.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.roomName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-3 flex items-end gap-4 text-xs text-muted-foreground">
                  <legend />
                </div>
              </div>

              <div className="[&_.fc-daygrid-day-number]:text-xs">
                <FullCalendar
                  ref={calRef as any}
                  plugins={[dayGridPlugin, interactionPlugin]}
                  initialView="dayGridMonth"
                  height="auto"
                  headerToolbar={{
                    left: "prev,next today",
                    center: "title",
                    right: "",
                  }}
                  datesSet={handleDatesSet}
                  events={events}
                  eventContent={renderEventContent}
                  displayEventTime={false}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </ProtectedPage>
    </Suspense>
  );
}
