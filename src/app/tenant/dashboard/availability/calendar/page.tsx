"use client";

import { useState, useEffect, useCallback } from "react";
import { Calendar, dateFnsLocalizer, View } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { id } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { axios } from "@/lib/axios";
import {
  Calendar as CalendarIcon,
  Trash2,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Sun,
  History,
} from "lucide-react";
import ProtectedPage from "@/components/protectedPage";

const locales = { id: id };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

interface PeakSeasonEvent {
  id?: number;
  title: string;
  start: Date;
  end: Date;
  isAvailable: boolean;
  percentage?: number;
  nominal?: number;
  type: "normal" | "peak" | "unavailable";
}

interface ApiPeakSeason {
  id: number;
  startDate: string;
  endDate: string;
  isAvailable: boolean;
  percentage?: number;
  nominal?: number;
}

export default function PeakSeasonCalendar({
  roomTypeId,
}: {
  roomTypeId: number;
}) {
  const [events, setEvents] = useState<PeakSeasonEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>("month");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [selectedType, setSelectedType] = useState<
    "normal" | "peak" | "unavailable"
  >("normal");
  const [adjustmentValue, setAdjustmentValue] = useState("");
  const [adjustmentType, setAdjustmentType] = useState<
    "percentage" | "nominal"
  >("percentage");
  const [selectedEvents, setSelectedEvents] = useState<PeakSeasonEvent[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectionKey, setSelectionKey] = useState(0);

  const label = format(currentDate, "MMMM yyyy", { locale: id });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get<ApiPeakSeason[]>(
        `/api/peak-season/${roomTypeId}`
      );

      const data: PeakSeasonEvent[] = res.data.map((p) => {
        let title = "❌ Tidak Tersedia";
        let type: "normal" | "peak" | "unavailable" = "unavailable";

        if (p.isAvailable) {
          if (p.percentage || p.nominal) {
            title = p.percentage
              ? `📈 +${p.percentage}%`
              : `💰 +Rp${p.nominal?.toLocaleString("id-ID")}`;
            type = "peak";
          } else {
            title = "✅ Tersedia";
            type = "normal";
          }
        }

        return {
          id: p.id,
          title,
          start: new Date(p.startDate),
          end: new Date(p.endDate),
          isAvailable: p.isAvailable,
          percentage: p.percentage,
          nominal: p.nominal,
          type,
        };
      });

      setEvents(data);
    } catch (err) {
      console.error("Failed to fetch peak season data:", err);
    } finally {
      setLoading(false);
    }
  }, [roomTypeId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
    const isSameDay = start.toDateString() === end.toDateString();

    if (isMobile && isSameDay) {
      setSelectedDates([start]);
    } else {
      const dates: Date[] = [];
      const current = new Date(start);
      while (current <= end) {
        dates.push(new Date(current));
        current.setDate(current.getDate() + 1);
      }
      setSelectedDates(dates);
    }

    setSelectedType("normal");
    setAdjustmentValue("");
    setAdjustmentType("percentage");
  };

  const handleApplyPrice = async () => {
    if (selectedDates.length === 0) return;

    try {
      const startDate = selectedDates[0];
      const endDate = selectedDates[selectedDates.length - 1];

      const payload: any = {
        roomTypeId,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        isAvailable: selectedType !== "unavailable",
      };

      if (selectedType === "peak" && adjustmentValue) {
        if (adjustmentType === "percentage") {
          payload.percentage = parseInt(adjustmentValue);
        } else {
          payload.nominal = parseInt(adjustmentValue);
        }
      }

      await axios.post("/api/peak-season", payload);
      await fetchData();
      setSelectedDates([]);
      setSelectedType("normal");
      setAdjustmentValue("");
      setAdjustmentType("percentage");
    } catch (err) {
      console.error("Failed to update pricing:", err);
      alert("Gagal menyimpan perubahan. Silakan coba lagi.");
    }
  };

  const handleCancel = () => {
    setSelectedDates([]);
    setSelectedType("normal");
    setAdjustmentValue("");
    setAdjustmentType("percentage");
    setSelectionKey((prev) => prev + 1); 
  };

  const handleSelectEvent = async (event: PeakSeasonEvent, e?: any) => {
    if (e && e.ctrlKey) {
      setSelectedEvents((prev) =>
        prev.some((e) => e.id === event.id)
          ? prev.filter((e) => e.id !== event.id)
          : [...prev, event]
      );
      setShowBulkActions(true);
      return;
    }

    const action = window.confirm(
      `Hapus pengaturan harga untuk periode:\n${format(
        event.start,
        "dd/MM/yyyy"
      )} - ${format(event.end, "dd/MM/yyyy")}?`
    );

    if (action && event.id) {
      try {
        await axios.delete(`/api/peak-season/${event.id}`);
        await fetchData();
      } catch (err) {
        console.error("Failed to delete:", err);
        alert("Gagal menghapus. Silakan coba lagi.");
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedEvents.length === 0) return;

    const action = window.confirm(
      `Hapus ${selectedEvents.length} pengaturan harga yang dipilih?`
    );

    if (action) {
      try {
        await Promise.all(
          selectedEvents.map((event) =>
            event.id
              ? axios.delete(`/api/peak-season/${event.id}`)
              : Promise.resolve()
          )
        );
        await fetchData();
        setSelectedEvents([]);
        setShowBulkActions(false);
      } catch (err) {
        console.error("Failed to bulk delete:", err);
        alert("Gagal menghapus beberapa item. Silakan coba lagi.");
      }
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`/api/peak-season/history/${roomTypeId}`);
      setHistoryData(res.data);
      setShowHistory(true);
    } catch (err) {
      console.error("Failed to fetch history:", err);
      alert("Gagal memuat riwayat perubahan.");
    }
  };

  const eventStyleGetter = (event: PeakSeasonEvent) => {
    const styles = {
      normal: { bg: "#10b981", text: "✅ Tersedia" },
      peak: { bg: "#f59e0b", text: "📈 Harga Naik" },
      unavailable: { bg: "#ef4444", text: "❌ Tidak Tersedia" },
    };

    const style = styles[event.type];

    return {
      style: {
        backgroundColor: style.bg,
        borderRadius: "6px",
        color: "white",
        border: "none",
        fontSize: "12px",
        padding: "4px 6px",
        fontWeight: 500,
        cursor: "pointer",
      },
    };
  };

  const handleNavigate = (newDate: Date) => {
    setCurrentDate(newDate);
    setSelectedYear(newDate.getFullYear());
  };

  const handleYearChange = (year: number) => {
    setSelectedYear(year);
    const newDate = new Date(year, currentDate.getMonth(), 1);
    setCurrentDate(newDate);
  };

  const CustomToolbar = () => (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
      <div className="flex items-center gap-2"></div>
      <div className="flex items-center gap-2"></div>
    </div>
  );

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-48"></div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <ProtectedPage role="TENANT">
      <>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                <div>
                  <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                    {label}
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Klik tanggal untuk atur harga
                  </p>
                </div>
              </div>

              {/* Enhanced Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={fetchHistory}
                  className="flex items-center gap-2 px-2 sm:px-3 py-2 text-xs sm:text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  title="View change history"
                >
                  <History className="w-3 h-3 sm:w-4 sm:h-4" />
                  {!isMobile && "History"}
                </button>

                {/* Year Selector */}
                <select
                  value={selectedYear}
                  onChange={(e) => handleYearChange(parseInt(e.target.value))}
                  className="px-2 sm:px-3 py-2 text-xs sm:text-sm bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {Array.from({ length: 10 }, (_, i) => {
                    const year = new Date().getFullYear() - 2 + i;
                    return (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    );
                  })}
                </select>

                {/* Navigation */}
                <button
                  onClick={() =>
                    handleNavigate(
                      new Date(
                        currentDate.getFullYear(),
                        currentDate.getMonth() - 1,
                        1
                      )
                    )
                  }
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
                <button
                  onClick={() => handleNavigate(new Date())}
                  className="px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Hari Ini
                </button>
                <button
                  onClick={() =>
                    handleNavigate(
                      new Date(
                        currentDate.getFullYear(),
                        currentDate.getMonth() + 1,
                        1
                      )
                    )
                  }
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Calendar Container */}
          <div className="p-2 sm:p-4 md:p-6">
            <div className="calendar-container w-full">
              <Calendar
                key={selectionKey}
                selectable
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                view={isMobile ? "month" : view}
                date={currentDate}
                onNavigate={handleNavigate}
                onView={(newView) => {
                  if (newView === "month" || newView === "week") {
                    setView(newView);
                  }
                }}
                onDrillDown={() => {}}
                onSelectSlot={handleSelectSlot}
                onSelectEvent={handleSelectEvent}
                eventPropGetter={eventStyleGetter}
                popup
                components={{
                  toolbar: CustomToolbar,
                }}
                style={{
                  height: isMobile ? "350px" : "400px",
                  minHeight: isMobile ? "300px" : "350px",
                  width: "100%",
                  touchAction: isMobile ? "pan-x pan-y" : "auto",
                }}
                messages={{
                  today: "Hari Ini",
                  previous: "←",
                  next: "→",
                  month: "Bulan",
                  week: "Minggu",
                  day: "Hari",
                  noEventsInRange: "Tidak ada harga khusus",
                }}
              />
            </div>

            {/* Legend and Usage Guide */}
            <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <h3 className="text-xs sm:text-sm font-semibold text-gray-900 mb-2 sm:mb-3">
                    Keterangan:
                  </h3>
                  <div className="flex flex-wrap gap-3 sm:gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded"></div>
                      <span className="text-xs sm:text-sm text-gray-700">
                        Harga Normal
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 sm:w-3 sm:h-3 bg-amber-500 rounded"></div>
                      <span className="text-xs sm:text-sm text-gray-700">
                        Harga Naik
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded"></div>
                      <span className="text-xs sm:text-sm text-gray-700">
                        Tidak Tersedia
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Inline Price Form */}
            {selectedDates.length > 0 && (
              <div className="mt-4 sm:mt-6 p-4 sm:p-6 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                      Atur Harga untuk {selectedDates.length} Hari
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">
                      {format(selectedDates[0], "dd MMM yyyy")}
                      {selectedDates.length > 1 &&
                        ` - ${format(
                          selectedDates[selectedDates.length - 1],
                          "dd MMM yyyy"
                        )}`}
                    </p>
                  </div>
                  <button
                    onClick={handleCancel}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Type Selection */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                      Tipe Pengaturan
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <button
                        onClick={() => setSelectedType("normal")}
                        className={`p-3 rounded-lg border text-left transition-colors ${
                          selectedType === "normal"
                            ? "bg-green-100 border-green-300 text-green-800"
                            : "bg-white border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Sun className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="text-xs sm:text-sm font-medium">
                            Harga Normal
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                          Tersedia dengan harga biasa
                        </p>
                      </button>

                      <button
                        onClick={() => setSelectedType("peak")}
                        className={`p-3 rounded-lg border text-left transition-colors ${
                          selectedType === "peak"
                            ? "bg-amber-100 border-amber-300 text-amber-800"
                            : "bg-white border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="text-xs sm:text-sm font-medium">
                            Naikkan Harga
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                          Tambah persentase atau nominal
                        </p>
                      </button>

                      <button
                        onClick={() => setSelectedType("unavailable")}
                        className={`p-3 rounded-lg border text-left transition-colors ${
                          selectedType === "unavailable"
                            ? "bg-red-100 border-red-300 text-red-800"
                            : "bg-white border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="text-xs sm:text-sm font-medium">
                            Tidak Tersedia
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                          Tutup pemesanan
                        </p>
                      </button>
                    </div>
                  </div>

                  {/* Peak Price Configuration */}
                  {selectedType === "peak" && (
                    <div className="space-y-3">
                      <label className="block text-xs sm:text-sm font-medium text-gray-700">
                        Konfigurasi Kenaikan Harga
                      </label>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1">
                          <select
                            value={adjustmentType}
                            onChange={(e) =>
                              setAdjustmentType(
                                e.target.value as "percentage" | "nominal"
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                          >
                            <option value="percentage">Persentase (%)</option>
                            <option value="nominal">Nominal (Rp)</option>
                          </select>
                        </div>
                        <div className="flex-1">
                          <input
                            type="number"
                            value={adjustmentValue}
                            onChange={(e) => setAdjustmentValue(e.target.value)}
                            placeholder={
                              adjustmentType === "percentage" ? "20" : "100000"
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                          />
                        </div>
                      </div>
                      {adjustmentValue && (
                        <p className="text-xs sm:text-sm text-gray-600">
                          {adjustmentType === "percentage"
                            ? `Harga akan naik ${adjustmentValue}%`
                            : `Harga akan naik Rp${parseInt(
                                adjustmentValue
                              ).toLocaleString("id-ID")}`}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <button
                      onClick={handleApplyPrice}
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm sm:text-base"
                    >
                      Simpan Perubahan
                    </button>
                    <button
                      onClick={handleCancel}
                      className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bulk Actions Modal */}
        {showBulkActions && selectedEvents.length > 0 && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Bulk Actions ({selectedEvents.length} selected)
                </h3>
                <button
                  onClick={() => {
                    setShowBulkActions(false);
                    setSelectedEvents([]);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleBulkDelete}
                  className="w-full flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Selected Events
                </button>
              </div>
            </div>
          </div>
        )}

        {/* History Modal */}
        {showHistory && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-lg flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Change History
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowHistory(false)}
                    className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Kembali
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {historyData.length > 0 ? (
                  historyData.map((item: any, index: number) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-3"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {item.action}
                          </p>
                          <p className="text-xs text-gray-600">
                            {format(
                              new Date(item.timestamp),
                              "dd MMM yyyy HH:mm"
                            )}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-700">
                            {item.details}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    No history available
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Custom CSS */}
        <style jsx global>{`
          /* Base calendar styles */
          .rbc-calendar {
            font-family: inherit;
            width: 100%;
            min-width: 0;
          }

          .rbc-calendar-container {
            width: 100%;
            overflow-x: hidden;
          }

          .rbc-header {
            padding: 8px 4px;
            font-weight: 600;
            background-color: #f9fafb;
            font-size: 12px;
          }

          .rbc-date-cell {
            padding: 4px 2px;
          }

          .rbc-date-cell button {
            width: 28px;
            height: 28px;
            border-radius: 50%;
            transition: all 0.2s;
            font-size: 11px;
          }

          .rbc-date-cell button:hover {
            background-color: #3b82f6;
            color: white;
          }

          .rbc-event {
            min-height: 20px;
            font-size: 10px;
            font-weight: 500;
            border: none;
            padding: 2px 4px;
          }

          /* Week view styling - hide time slots and show clean grid */
          .rbc-time-view .rbc-time-gutter,
          .rbc-time-view .rbc-time-header-gutter,
          .rbc-time-view .rbc-time-header {
            display: none !important;
          }

          .rbc-time-view .rbc-time-content {
            border-top: none;
          }

          .rbc-time-view .rbc-day-slot {
            border-left: 1px solid #e5e7eb;
            min-height: 150px;
            position: relative;
          }

          .rbc-time-view .rbc-day-slot:first-child {
            border-left: none;
          }

          .rbc-time-view .rbc-header {
            border-bottom: 2px solid #e5e7eb;
            background-color: #f9fafb;
            font-weight: 600;
            padding: 8px 4px;
            text-align: center;
            font-size: 11px;
          }

          .rbc-time-view .rbc-date-cell {
            padding: 4px;
            text-align: center;
            font-weight: 600;
            color: #374151;
            background-color: #f9fafb;
            border-bottom: 1px solid #e5e7eb;
            font-size: 11px;
          }

          .rbc-time-view .rbc-events-container {
            padding: 4px;
            height: 100%;
          }

          .rbc-time-view .rbc-event {
            border-radius: 4px;
            border: none;
            padding: 2px 4px;
            margin: 1px 0;
            font-size: 10px;
            font-weight: 500;
            width: calc(100% - 4px);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .rbc-time-view .rbc-day-bg,
          .rbc-time-view .rbc-timeslot-group {
            display: none;
          }

          /* 🔧 Fix scroll & tap on mobile */
          .calendar-container {
            overflow: auto !important;
            -webkit-overflow-scrolling: touch;
          }

          @media (max-width: 768px) {
            .rbc-calendar {
              font-size: 11px;
              touch-action: manipulation !important; /* supaya gesture tap bekerja */
              user-select: none;
            }

            .rbc-month-view {
              overflow: hidden !important;
            }

            .rbc-date-cell {
              padding: 2px 1px;
              touch-action: manipulation !important;
            }

            .rbc-date-cell button {
              width: 24px;
              height: 24px;
              font-size: 10px;
            }

            .rbc-header {
              padding: 6px 2px;
              font-size: 11px;
            }

            .rbc-event {
              font-size: 9px;
              padding: 1px 2px;
            }

            .rbc-time-view .rbc-header {
              padding: 6px 2px;
              font-size: 10px;
            }

            .rbc-time-view .rbc-date-cell {
              padding: 2px;
              font-size: 10px;
            }

            .rbc-time-view .rbc-day-slot {
              min-height: 120px;
            }

            .rbc-time-view .rbc-events-container {
              padding: 2px;
            }

            .rbc-time-view .rbc-event {
              font-size: 9px;
              padding: 1px 2px;
              margin: 1px 0;
            }
          }
        `}</style>
      </>
    </ProtectedPage>
  );
}
