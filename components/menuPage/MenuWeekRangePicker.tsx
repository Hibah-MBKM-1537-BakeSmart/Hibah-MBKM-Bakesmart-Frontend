"use client";

import { useState, useEffect } from "react";
import { format, addDays, startOfDay, isSameDay } from "date-fns";
import { id } from "date-fns/locale";
import { Button } from "@/components/ui/button";

interface MenuWeekRangePickerProps {
  onDateSelect: (startDate: Date, endDate: Date, orderDay: string) => void;
  onViewModeChange?: (mode: "order" | "allMenu") => void;
  viewMode?: "order" | "allMenu";
}

export function MenuWeekRangePicker({
  onDateSelect,
  onViewModeChange,
  viewMode = "order",
}: MenuWeekRangePickerProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // 1. Definisikan Hari Ini (Jam 00:00:00)
  const today = startOfDay(new Date());

  const getIndonesianDayName = (date: Date): string => {
    return format(date, "EEEE", { locale: id });
  };

  useEffect(() => {
    // Default: Otomatis pilih hari ini saat load
    handleSelectDate(today);
  }, []);

  const handleSelectDate = (date: Date) => {
    setSelectedDate(date);

    // Kirim data range (misal 1 minggu dari tanggal yang dipilih)
    const start = new Date(date);
    const end = addDays(start, 6);
    const orderDay = getIndonesianDayName(date);

    onDateSelect(start, end, orderDay);
  };

  // 2. GENERATE TANGGAL STATIS (Fixed)
  // Loop 7 kali mulai dari hari ini.
  // User TIDAK BISA melihat tanggal ke-8 (tgl 13 dst) karena tidak kita buat.
  const visibleDates = Array.from({ length: 8 }, (_, i) => addDays(today, i));

  // Info Header Range
  const headerStart = visibleDates[0];
  const headerEnd = visibleDates[visibleDates.length - 1];

  return (
    <div className="bg-white border-b border-gray-200 py-3">
      <div className="flex items-center justify-between gap-2 px-4">
        {/* Info Range Tanggal (Statis) */}
        <div className="text-center flex-shrink-0 px-2 min-w-[100px]">
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider mb-0.5">
              Periode Pesan
            </span>
            <div className="text-sm font-bold text-[#8B6F47]">
              {format(headerStart, "d MMM", { locale: id })} -{" "}
              {format(headerEnd, "d MMM", { locale: id })}
            </div>
          </div>
        </div>

        {/* Grid Tanggal (Fixed 7 Hari) */}
        {/* Tidak ada tombol prev/next, jadi user terkunci disini */}
        <div className="flex-1 grid grid-cols-8 gap-1">
          {visibleDates.map((date) => {
            const isSelected = selectedDate && isSameDay(date, selectedDate);
            const dayName = getIndonesianDayName(date);
            const isToday = isSameDay(date, today);

            return (
              <button
                key={date.toISOString()}
                type="button"
                // Tidak perlu validasi "isAvailable" karena semua yg tampil disini PASTI available
                onClick={() => handleSelectDate(date)}
                className={`
                  p-1.5 rounded text-xs font-medium transition-all
                  flex flex-col items-center justify-center relative
                  ${
                    isToday
                      ? "bg-red-500 text-white shadow-md cursor-pointer transform scale-105 z-10 ring-2 ring-red-600"
                      : isSelected
                      ? "bg-[#8B6F47] text-white shadow-md cursor-pointer transform scale-105 z-10 ring-1 ring-[#5D4037]"
                      : "bg-gray-50 text-gray-700 hover:bg-gray-100 cursor-pointer border border-gray-100"
                  }
                `}
              >
                <span
                  className={`text-[10px] font-semibold leading-tight uppercase ${
                    isToday || isSelected ? "text-white" : "text-gray-500"
                  }`}
                >
                  {dayName.substring(0, 3)}
                </span>
                <span className="font-bold text-xs leading-tight mt-0.5">
                  {format(date, "d")}
                </span>
              </button>
            );
          })}
        </div>

        {/* Tombol Toggle Mode */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() =>
            onViewModeChange?.(viewMode === "order" ? "allMenu" : "order")
          }
          className="flex-shrink-0 px-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 whitespace-nowrap text-sm ml-1 border border-dashed border-gray-300"
        >
          {viewMode === "order" ? "Lihat Semua" : "Pesan"}
        </Button>
      </div>
    </div>
  );
}
